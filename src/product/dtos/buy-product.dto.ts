import { IsMongoId, IsString } from 'class-validator';

export class BuyProductDto {
  @IsString()
  paymentMethod: string;

  @IsMongoId()
  product: string;
}
