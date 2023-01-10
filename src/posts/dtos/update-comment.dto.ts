import { IsMongoId, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  content: string;

  @IsString()
  @IsMongoId()
  postId: string;

  @IsString()
  @IsMongoId()
  commentId: string;
}
