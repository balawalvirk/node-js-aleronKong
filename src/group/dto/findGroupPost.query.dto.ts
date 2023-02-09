import { IsOptional } from 'class-validator';

export class FindPostsOfGroupQueryDto {
  @IsOptional()
  page: string;

  @IsOptional()
  limit: string;
}
