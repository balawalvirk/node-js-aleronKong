import {IsOptional, IsString} from 'class-validator';

export class FindAllQueryDto {
    @IsOptional()
    @IsString({each: true})
    type: string;

    @IsOptional()
    limit: string;

    @IsOptional()
    query: string = '';

    @IsOptional()
    page: string;


    @IsOptional()
    pageId: string;

}
