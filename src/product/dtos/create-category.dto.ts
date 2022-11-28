import { IsEnum, IsString } from 'class-validator';
import { ProductState } from 'src/types';

export class CreateProductCategoryDto {
  @IsString()
  title: string;

  @IsString()
  value: string;

  @IsEnum(ProductState)
  state: string;
}
