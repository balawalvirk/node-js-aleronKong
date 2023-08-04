import { IsEnum, IsOptional } from 'class-validator';
import { PageFilter } from 'src/types';

export class FindAllPagesQueryDto {
  @IsOptional()
  @IsEnum(PageFilter, { each: true })
  filter: string = PageFilter.ALL;

  @IsOptional()
  limit: string;

  @IsOptional()
  query: string = '';

  @IsOptional()
  page: string;
}
