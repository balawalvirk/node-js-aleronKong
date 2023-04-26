import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ProductType } from 'src/types';

export class CreateProductCategoryDto {
  @IsString()
  title: string;

  @IsEnum(ProductType)
  type: string;

  @IsNumber()
  commission: number;
}
