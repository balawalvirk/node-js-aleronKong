import {IsEnum, IsMongoId, IsOptional, IsString} from 'class-validator';
import { AGORA_RTC_ROLE } from 'src/types';

export class UpdateThumbnailDto {

    @IsString()
    thumbnail: string;
}
