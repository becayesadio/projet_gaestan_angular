import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import type { DbSchema, CategoryEntity, PromptEntity } from './storage.types';

@Injectable()
export class StorageService {
  private readonly dbPath: string;

  constructor() {
    const dataDir = process.env.DATA_DIR ?? join(process.cwd(), 'data');
    this.dbPath = join(dataDir, 'db.json');
  }

  getDb(): DbSchema {
    this.ensureDataDir();
    if (!existsSync(this.dbPath)) {
      const initial: DbSchema = { categories: [], prompts: [] };
      this.writeDb(initial);
      return initial;
    }
    const raw = readFileSync(this.dbPath, 'utf-8');
    return JSON.parse(raw) as DbSchema;
  }

  private writeDb(db: DbSchema): void {
    this.ensureDataDir();
    writeFileSync(this.dbPath, JSON.stringify(db, null, 2), 'utf-8');
  }

  private ensureDataDir(): void {
    const dir = join(this.dbPath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  saveDb(db: DbSchema): void {
    this.writeDb(db);
  }

  getNextPromptId(db: DbSchema): number {
    if (db.prompts.length === 0) return 1;
    return Math.max(...db.prompts.map((p) => p.id)) + 1;
  }

  getCategoryById(db: DbSchema, id: number): CategoryEntity | undefined {
    return db.categories.find((c) => c.id === id);
  }

  getPromptById(db: DbSchema, id: number): PromptEntity | undefined {
    return db.prompts.find((p) => p.id === id);
  }
}
