import { IsString, IsDateString, IsOptional } from 'class-validator';

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
