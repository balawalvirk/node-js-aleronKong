import { IsMongoId, IsOptional } from 'class-validator';

export class FindAllProductsQuery {
  @IsOptional()
  @IsMongoId()
  category: string;

  @IsOptional()
  limit: string;

  @IsOptional()
  page: string;
}
