import { IsOptional } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;

  @IsOptional()
  query: string = '';
}
