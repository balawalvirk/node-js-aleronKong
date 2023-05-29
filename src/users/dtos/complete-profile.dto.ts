import { IsString, IsDateString } from 'class-validator';

export class CompleteProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  birthDate: Date;

  @IsString()
  avatar: string;

  @IsString()
  userName: string;
}
