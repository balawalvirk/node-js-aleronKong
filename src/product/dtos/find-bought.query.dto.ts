import { IsEnum, IsOptional } from 'class-validator';
import { BoughtProductsSort } from 'src/types';

export class FindBoughtProductsQueryDto {
  @IsOptional()
  @IsEnum(BoughtProductsSort, { each: true })
  sort: string = BoughtProductsSort.TITLE;
}
