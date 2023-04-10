import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ProductStatus } from 'src/types';

export class FindAllProductsQuery {
  @IsOptional()
  @IsMongoId()
  category: string;

  @IsOptional()
  @IsMongoId()
  creator: string;

  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;

  @IsOptional()
  @IsEnum(ProductStatus, { each: true })
  status: string;
}
