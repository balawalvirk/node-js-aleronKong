import { IsString } from 'class-validator';

export class CreateSellerDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  ssnLast4: string;

  @IsString()
  city: string;

  @IsString()
  line1: string;

  @IsString()
  postalCode: string;

  @IsString()
  state: string;
}
