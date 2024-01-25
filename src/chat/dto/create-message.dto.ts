import {IsMongoId, IsOptional, IsString} from 'class-validator';

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
    @IsString({each: true})
    videos?: string[];

    @IsOptional()
    @IsString({each: true})
    images?: string[];
}
