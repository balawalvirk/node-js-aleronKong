import { IsMongoId, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  paymentMethod: string;

  @IsMongoId()
  address: string;

  @IsMongoId({ each: true })
  products: string[];
}
