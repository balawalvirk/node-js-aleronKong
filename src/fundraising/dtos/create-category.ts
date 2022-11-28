import { IsString } from 'class-validator';

export class CreateFudraisingCategoryDto {
  @IsString()
  title: string;
}
