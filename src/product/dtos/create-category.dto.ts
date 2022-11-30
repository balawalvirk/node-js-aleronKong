import { IsEnum, IsString } from 'class-validator';
import { ProductType } from 'src/types';

export class CreateProductCategoryDto {
  @IsString()
  title: string;

  @IsString()
  value: string;

  @IsEnum(ProductType)
  type: string;
}
