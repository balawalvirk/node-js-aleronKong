import { IsOptional } from 'class-validator';

export class FindAllPostQuery {
  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;

  @IsOptional()
  query: string = '';
}
