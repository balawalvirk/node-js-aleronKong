import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/helpers';
import { EngagedPostFilter } from 'src/types';

export class FindEngagedPostQuery extends PaginationDto {
  @IsOptional()
  @IsEnum(EngagedPostFilter, { each: true })
  filter: string = EngagedPostFilter.ALL;
}
