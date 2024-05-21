import {IsArray, IsMongoId, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";




class Video {
    @IsString()
    url: string;

    @IsString()
    thumbnail: string;
}

export class CreateMessageDto {
    @IsOptional()
    @IsString()
    content: string;

    @IsMongoId()
    chat: string;

    @IsOptional()
    @IsMongoId()
    post: string;


    @IsOptional()
    @IsString()
    gif?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => Video)
    videos?: Video;



    @IsOptional()
    @IsString({each: true})
    images?: string[];
}
