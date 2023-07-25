import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PostPrivacy } from 'src/types';

export class CreatePostsDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string;

  @IsOptional()
  @IsString({ each: true })
  videos?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsEnum(PostPrivacy)
  privacy: string;

  @IsOptional()
  @IsMongoId()
  group?: string;

  @IsOptional()
  @IsMongoId({ each: true })
  tagged?: string[];

  @IsOptional()
  @IsMongoId({ each: true })
  mentions?: string[];

  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsMongoId()
  sharedPost?: string;
}
