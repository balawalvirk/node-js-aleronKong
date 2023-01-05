import { IsString } from 'class-validator';

export class AddToCartDto {
  @IsString()
  selectedColor: string;

  @IsString()
  selectedSize: string;
}
