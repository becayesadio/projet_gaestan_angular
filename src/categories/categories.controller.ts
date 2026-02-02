import { Controller, Get } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly storage: StorageService) {}

  @Get()
  findAll() {
    const db = this.storage.getDb();
    return db.categories;
  }
}
