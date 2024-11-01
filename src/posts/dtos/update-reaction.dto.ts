import {IsEnum, IsMongoId, IsOptional} from 'class-validator';
import {Emoji} from 'src/types';

export class UpdateReactionsDto {
    @IsEnum(Emoji, {each: true})
    emoji: string;


    @IsOptional()
    @IsMongoId()
    post: string;

    @IsOptional()
    @IsMongoId()
    page: string;


    @IsOptional()
    @IsMongoId()
    comment: string;


}
