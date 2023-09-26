import {IsBoolean, IsOptional, IsString} from 'class-validator';

export class UpdatePageModeratorDto {
    @IsOptional()
    @IsString()
    nickName: string;

    @IsOptional()
    @IsBoolean()
    createPost: boolean;

    @IsOptional()
    @IsBoolean()
    engageAsPage: boolean;


    @IsOptional()
    @IsBoolean()
    deletePage: boolean;


    @IsOptional()
    @IsBoolean()
    editPage: boolean;

}
