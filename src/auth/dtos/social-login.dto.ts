import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';

export class SocialLoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(['local', 'facebook', 'twitter', 'linkedin', 'instagram'])
  authType: string;
}
