import { IsString, IsDateString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  userName: string;

  @IsDateString()
  birthDate: Date;

  @IsString()
  avatar: string;
}
