import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostsDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  media: string;

  @IsNotEmpty()
  @IsEnum(['guildMembers', 'followers', 'public'])
  privacy: string;
}
