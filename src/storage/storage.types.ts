export interface CategoryEntity {
  id: number;
  name: string;
}

export interface PromptEntity {
  id: number;
  title: string;
  content: string;
  categoryId: number;
  score: number;
  createdAt: string;
}

export interface DbSchema {
  categories: CategoryEntity[];
  prompts: PromptEntity[];
}
