import { IsOptional, IsString } from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  selectedColor?: string;

  @IsOptional()
  @IsString()
  selectedSize?: string;
}
