import { IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  label: string;

  @IsString()
  line1: string;

  @IsString()
  line2: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;
}
