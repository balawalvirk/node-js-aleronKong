import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { AuthTypes } from 'src/types';

export class SocialLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(AuthTypes, { each: true })
  authType: string;
}
