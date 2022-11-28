import { IsEnum, IsString } from 'class-validator';
import { GroupPrivacy } from 'src/types';

export class CreateGroupDto {
  @IsString()
  coverPhoto: string;

  @IsString()
  profilePhoto: string;

  @IsString()
  description: string;

  @IsString()
  name: string;

  @IsEnum(GroupPrivacy)
  privacy: string;
}
