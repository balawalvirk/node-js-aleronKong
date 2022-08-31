import { IsNotEmpty, IsString, MinLength, IsNumber } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsNumber()
  otp: number;
}
