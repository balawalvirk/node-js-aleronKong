import { IsMongoId, IsString } from 'class-validator';

export class BuySeriesDto {
  @IsString()
  paymentMethod: string;

  @IsMongoId()
  product: string;

  @IsMongoId({ each: true })
  series: string[];
}
