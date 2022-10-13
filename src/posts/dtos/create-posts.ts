import { IsEnum, IsString } from 'class-validator';

export class CreatePostsDto {
  @IsString()
  content: string;

  @IsString({ each: true })
  media: string;

  @IsEnum(['guildMembers', 'followers', 'public'])
  privacy: string;
}
