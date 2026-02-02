import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import type { PromptEntity } from '../storage/storage.types';

// Response type: prompt with category populated (no categoryId, use category.id)
export interface PromptWithCategoryDto {
  id: number;
  title: string;
  content: string;
  score: number;
  createdAt: string;
  category: { id: number; name: string };
}

function toPromptWithCategory(
  prompt: PromptEntity,
  category: { id: number; name: string } | undefined,
): PromptWithCategoryDto {
  return {
    id: prompt.id,
    title: prompt.title,
    content: prompt.content,
    score: prompt.score,
    createdAt: prompt.createdAt,
    category: category ?? { id: prompt.categoryId, name: '' },
  };
}

@Controller('prompts')
export class PromptsController {
  constructor(private readonly storage: StorageService) {}

  @Get()
  findAll(): PromptWithCategoryDto[] {
    const db = this.storage.getDb();
    const sorted = [...db.prompts].sort((a, b) => b.score - a.score);
    return sorted.map((prompt) => {
      const category = this.storage.getCategoryById(db, prompt.categoryId);
      return toPromptWithCategory(prompt, category);
    });
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): PromptWithCategoryDto {
    const db = this.storage.getDb();
    const prompt = this.storage.getPromptById(db, id);
    if (!prompt) throw new NotFoundException('Prompt not found');
    const category = this.storage.getCategoryById(db, prompt.categoryId);
    return toPromptWithCategory(prompt, category);
  }

  @Post()
  create(@Body() dto: CreatePromptDto): PromptWithCategoryDto {
    const db = this.storage.getDb();
    const id = this.storage.getNextPromptId(db);
    const prompt: PromptEntity = {
      id,
      title: dto.title,
      content: dto.content,
      categoryId: dto.categoryId,
      score: 0,
      createdAt: new Date().toISOString(),
    };
    db.prompts.push(prompt);
    this.storage.saveDb(db);
    const category = this.storage.getCategoryById(db, prompt.categoryId);
    return toPromptWithCategory(prompt, category);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePromptDto,
  ): PromptWithCategoryDto {
    const db = this.storage.getDb();
    const index = db.prompts.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Prompt not found');
    const prompt = db.prompts[index];
    if (dto.title !== undefined) prompt.title = dto.title;
    if (dto.content !== undefined) prompt.content = dto.content;
    if (dto.categoryId !== undefined) prompt.categoryId = dto.categoryId;
    this.storage.saveDb(db);
    const category = this.storage.getCategoryById(db, prompt.categoryId);
    return toPromptWithCategory(prompt, category);
  }

  @Post(':id/upvote')
  upvote(
    @Param('id', ParseIntPipe) id: number,
  ): PromptWithCategoryDto {
    const db = this.storage.getDb();
    const prompt = this.storage.getPromptById(db, id);
    if (!prompt) throw new NotFoundException('Prompt not found');
    prompt.score += 1;
    this.storage.saveDb(db);
    const category = this.storage.getCategoryById(db, prompt.categoryId);
    return toPromptWithCategory(prompt, category);
  }

  @Post(':id/downvote')
  downvote(
    @Param('id', ParseIntPipe) id: number,
  ): PromptWithCategoryDto {
    const db = this.storage.getDb();
    const prompt = this.storage.getPromptById(db, id);
    if (!prompt) throw new NotFoundException('Prompt not found');
    prompt.score -= 1;
    this.storage.saveDb(db);
    const category = this.storage.getCategoryById(db, prompt.categoryId);
    return toPromptWithCategory(prompt, category);
  }
}
