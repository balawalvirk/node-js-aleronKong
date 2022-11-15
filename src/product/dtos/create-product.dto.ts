import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductState, ProductTypes } from 'src/types';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  media: string[];

  @IsEnum(ProductState)
  state: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsNumber()
  price: number;

  @IsEnum(ProductTypes)
  type: string;

  @IsNumber()
  quantity: number;

  @IsBoolean()
  syncWithAmazon: boolean;
}
