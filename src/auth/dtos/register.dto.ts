import { IsNotEmpty, IsEmail, IsString, MinLength } from 'class-validator';
import { Match } from 'src/helpers/decorators/match.decorator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @Match('password')
  confirmPassword: string;
}
