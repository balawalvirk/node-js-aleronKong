import {Transform} from 'class-transformer';
import {IsEnum, IsMongoId, isMongoId, IsOptional, IsString} from 'class-validator';
import {TransectionDuration} from 'src/types';

export class FindTransectionsQueryDto {
    @IsOptional()
    @Transform(({value}) => parseInt(value))
    limit: number = 10;

    @IsOptional()
    @IsString()
    lastRecord?: string;

    @IsEnum(TransectionDuration, {each: true})
    duration: string = TransectionDuration.WEEK;
}


export class UserHomeQueryDto {
    @IsOptional()
    @IsMongoId()
    pageId: string;

}
