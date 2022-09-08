import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostsDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  media: string;

  @IsOptional()
  @IsEnum(['guildMembers', 'followers', 'public'])
  privacy: string;
}
