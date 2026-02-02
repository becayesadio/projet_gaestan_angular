import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { StorageService } from '../storage/storage.service';
import type { UserEntity } from '../storage/storage.types';
import type { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly storage: StorageService,
    private readonly jwtService: JwtService,
  ) {}

  async register(username: string, password: string): Promise<{ access_token: string }> {
    const db = this.storage.getDb();
    const existing = this.storage.getUserByUsername(db, username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }
    const hash = await bcrypt.hash(password, 10);
    const id = this.storage.getNextUserId(db);
    db.users.push({ id, username, passwordHash: hash });
    this.storage.saveDb(db);
    return this.login({ id, username, passwordHash: hash });
  }

  async validateUser(username: string, password: string): Promise<UserEntity | null> {
    const db = this.storage.getDb();
    const user = this.storage.getUserByUsername(db, username);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  login(user: UserEntity): { access_token: string } {
    const payload = { sub: user.id, username: user.username };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  async loginWithCredentials(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.login(user);
  }

  /** Returns current user if valid JWT in request; otherwise null (for optional auth on GET). */
  getOptionalUserFromRequest(req: Request): UserEntity | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    const token = auth.slice(7);
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      const db = this.storage.getDb();
      const user = this.storage.getUserById(db, payload.sub);
      return user ?? null;
    } catch {
      return null;
    }
  }
}
