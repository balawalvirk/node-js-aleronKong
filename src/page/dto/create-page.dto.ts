import { IsString } from 'class-validator';

export class CreatePageDto {
  @IsString()
  coverPhoto: string;

  @IsString()
  profilePhoto: string;

  @IsString()
  description: string;

  @IsString()
  name: string;
}
