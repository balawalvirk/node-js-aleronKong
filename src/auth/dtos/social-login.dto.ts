import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthTypes } from 'src/types';

export class SocialLoginDto {
  @IsEmail()
  email: string;

  @IsEnum(AuthTypes, { each: true })
  authType: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: Date;

  @IsOptional()
  @IsString()
  avatar?: string;
}
