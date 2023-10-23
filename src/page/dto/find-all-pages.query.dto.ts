import {IsBoolean, IsEnum, IsOptional, IsString} from 'class-validator';
import {PageFilter} from 'src/types';

export class FindAllPagesQueryDto {
    @IsOptional()
    @IsEnum(PageFilter, {each: true})
    filter;

    @IsOptional()
    limit: string;

    @IsOptional()
    query: string = '';

    @IsOptional()
    page: string;


    @IsOptional()
    @IsString()
    created: string;

    @IsOptional()
    @IsString()
    moderating: string;

    @IsOptional()
    @IsString()
    following: string;


    @IsOptional()
    pageId: string;


}
