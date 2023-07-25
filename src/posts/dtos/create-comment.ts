import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsMongoId()
  comment?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsString()
  gif?: string;
}
