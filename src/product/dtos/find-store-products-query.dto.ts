import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class FindStoreProductsQueryDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  creator: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  category: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showBoughtProducts: boolean;
}
