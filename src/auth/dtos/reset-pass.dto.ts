import { IsString, IsNumber } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  password: string;

  @IsNumber()
  otp: number;
}
