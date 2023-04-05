import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransectionDuration } from 'src/types';

export class FindTransectionsDto {
  @IsNumber()
  limit: number = 10;

  @IsOptional()
  @IsString()
  lastRecord?: string;

  @IsEnum(TransectionDuration, { each: true })
  duration: string = TransectionDuration.WEEK;
}
