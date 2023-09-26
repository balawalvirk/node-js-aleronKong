import {IsEnum, IsMongoId, IsOptional, IsString} from 'class-validator';
import { AGORA_RTC_ROLE } from 'src/types';

export class CreateBroadcastDto {
  @IsEnum(AGORA_RTC_ROLE, { each: true })
  role: string;


    @IsOptional()
    @IsMongoId()
    page: string;
}
