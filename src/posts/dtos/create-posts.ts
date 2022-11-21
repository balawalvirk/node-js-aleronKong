import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { PostPrivacy } from 'src/types';

export class CreatePostsDto {
  @IsString()
  content: string;

  @IsString({ each: true })
  media: string;

  @IsEnum(PostPrivacy)
  privacy: string;

  @IsOptional()
  @IsMongoId()
  group?: string;
}
