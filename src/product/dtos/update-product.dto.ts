import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsOptional } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsMongoId({ each: true })
  reviews?: string[];
}
