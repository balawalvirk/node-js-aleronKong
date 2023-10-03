import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdatePageCommentDto {
  @IsOptional()
  @IsString()
  content: string;

  @IsString()
  pageId: string;

  @IsString()
  commentId: string;

  @IsOptional()
  @IsString()
  gif: string;

  @IsOptional()
  @IsMongoId({ each: true })
  mentions: string[];
}
