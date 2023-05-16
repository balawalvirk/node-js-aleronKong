import { IsMongoId } from 'class-validator';

export class BuyProductDto {
  @IsMongoId()
  product: string;
}
