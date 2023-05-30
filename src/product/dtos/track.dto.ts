import { IsBoolean, IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class TrackDto {
  @IsMongoId()
  product: string;

  @IsOptional()
  @IsNumber()
  page: string;

  @IsOptional()
  @IsNumber()
  duration: string;

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;
}
