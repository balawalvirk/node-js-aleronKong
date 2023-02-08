import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { MuteInterval } from 'src/types';

export class MuteGroupDto {
  @IsMongoId()
  group: string;

  @IsEnum(MuteInterval, { each: true })
  interval: string;

  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
