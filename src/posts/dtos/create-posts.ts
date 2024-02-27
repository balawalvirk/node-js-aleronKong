import {IsArray, IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsString, ValidateNested} from 'class-validator';
import {PostPrivacy} from 'src/types';
import {Type} from "class-transformer";


class Video {
    @IsString()
    url: string;

    @IsString()
    thumbnail: string;
}


export class CreatePostsDto {
    @IsOptional()
    @IsString()
    content: string;

    @IsOptional()
    @IsString({each: true})
    images?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => Video)
    videos?: Video;

    @IsOptional()
    @IsString()
    status?: string;

    @IsEnum(PostPrivacy)
    privacy: string;

    @IsOptional()
    @IsMongoId()
    group?: string;

    @IsOptional()
    @IsMongoId({each: true})
    tagged?: string[];

    @IsOptional()
    @IsMongoId({each: true})
    mentions?: string[];

    @IsOptional()
    @IsString()
    gif?: string;

    @IsOptional()
    @IsMongoId()
    sharedPost?: string;

    @IsOptional()
    @IsMongoId()
    page?: string;
}
