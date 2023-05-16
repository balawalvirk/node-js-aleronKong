import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class SearchQueryDto {
  @IsOptional()
  @Transform(({ value }) => value.trim())
  query: string = '';

  @IsOptional()
  filter: string = 'all';

  @IsOptional()
  category: string;

  @IsOptional()
  sort: string = 'createdAt';
}
