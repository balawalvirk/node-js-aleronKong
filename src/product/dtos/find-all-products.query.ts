import { IsMongoId, IsOptional } from 'class-validator';

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
  query: string = '';
}
