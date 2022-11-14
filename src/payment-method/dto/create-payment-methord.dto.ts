import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentMethordDto {
  @IsString()
  name: string;

  @IsString()
  number: string;

  @IsNumber()
  expiryMonth: number;

  @IsNumber()
  expiryYear: number;

  @IsString()
  cvc: string;
}
