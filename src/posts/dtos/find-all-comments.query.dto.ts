import { IsOptional } from 'class-validator';

export class FindAllCommentQueryDto {
  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;
}
