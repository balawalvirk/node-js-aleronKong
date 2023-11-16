import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class FindAllPackagesQueryDto {
  @IsOptional()
  @IsMongoId()
  creator?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isGuildPackage?: boolean;

  @IsOptional()
  page: string;

  @IsOptional()
  query: string;

  @IsOptional()
  limit: string;
}


export class FindUserSubscribedPackagesQueryDto {

    @IsOptional()
    filter;

    @IsOptional()
    sort;


    @IsOptional()
    query: string;

    @IsOptional()
    limit: string;
}
