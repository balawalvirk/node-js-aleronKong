import { IsOptional } from 'class-validator';

export class FindAllCategoriesQueryDto {
  @IsOptional()
  type: string;

  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;

  @IsOptional()
  query: string;
}
