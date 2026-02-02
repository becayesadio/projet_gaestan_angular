import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { CategoriesModule } from './categories/categories.module';
import { PromptsModule } from './prompts/prompts.module';

@Module({
  imports: [StorageModule, CategoriesModule, PromptsModule],
})
export class AppModule {}
