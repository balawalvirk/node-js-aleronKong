import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

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
  @Transform(({ value }) => {
    console.log({ value });
    return value === 'true' ? true : false;
  })
  showBought: boolean;
}
