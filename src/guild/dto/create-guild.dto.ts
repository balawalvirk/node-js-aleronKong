import {IsBoolean, IsMongoId, IsNumber, IsOptional, IsString} from 'class-validator';

export class CreateGuildDto {
    @IsString()
    display_name: string;


    @IsString()
    description: string;


    @IsString()
    profile_photo: string;


    @IsString()
    cover_photo: string;


    @IsOptional()
    @IsMongoId({ each: true })
    benefits:string[];


}
