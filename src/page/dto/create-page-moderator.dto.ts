import {IsBoolean, IsMongoId, IsOptional, IsString} from 'class-validator';

export class CreatePageModeratorDto {
    @IsOptional()
    @IsString()
    nickName: string;

    @IsMongoId()
    user: string;

    @IsMongoId()
    page: string;


    @IsBoolean()
    createPost: boolean;

    @IsBoolean()
    engageAsPage: boolean;

    @IsBoolean()
    deletePage: boolean;

    @IsBoolean()
    editPage: boolean;
}
