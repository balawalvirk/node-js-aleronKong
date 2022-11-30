import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus, ProductType } from 'src/types';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  media: string[];

  @IsEnum(ProductType)
  type: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  file?: string;

  @IsNumber()
  price: number;

  @IsEnum(ProductStatus)
  status: string;

  @IsNumber()
  quantity: number;

  @IsBoolean()
  syncWithAmazon: boolean;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsMongoId()
  category: string;
}
