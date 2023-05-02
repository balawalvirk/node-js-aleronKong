import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ReportType } from 'src/types';

export class CreateReportDto {
  @IsEnum(ReportType, { each: true })
  type: string;

  @IsOptional()
  @IsMongoId()
  user?: string;

  @IsOptional()
  @IsMongoId()
  group?: string;

  @IsString()
  reason: string;
}
