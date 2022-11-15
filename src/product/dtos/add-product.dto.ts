import { IsMongoId } from 'class-validator';

export class AddProductDto {
  @IsMongoId()
  product: string;

  @IsMongoId()
  collection: string;
}
