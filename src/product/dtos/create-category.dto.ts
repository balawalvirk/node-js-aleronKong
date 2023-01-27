import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductType } from 'src/types';

export class CreateProductCategoryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  value: string;

  @IsEnum(ProductType)
  type: string;
}
