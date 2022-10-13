import { IsEnum, IsString } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  coverPhoto: string;

  @IsString()
  profilePhoto: string;

  @IsString()
  description: string;

  @IsString()
  name: string;

  @IsEnum(['private', 'public'])
  privacy: string;
}
