import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsMongoId()
  comment: string;

  @IsOptional()
  @IsString()
  gif: string;
}
