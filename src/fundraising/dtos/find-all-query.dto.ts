import { IsOptional } from 'class-validator';

export class FindAllFundraisingQueryDto {
  @IsOptional()
  page: string;

  @IsOptional()
  query: string;

  @IsOptional()
  limit: string;
}
