import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePromptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  categoryId: number;
}
