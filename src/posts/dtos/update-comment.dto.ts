import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content: string;

  @IsString()
  @IsMongoId()
  postId: string;

  @IsString()
  @IsMongoId()
  commentId: string;

  @IsOptional()
  @IsString()
  gif: string;

  @IsOptional()
  @IsMongoId({ each: true })
  mentions: string[];
}
