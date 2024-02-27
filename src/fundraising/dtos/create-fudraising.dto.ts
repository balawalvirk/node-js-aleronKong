import {IsArray, IsDateString, IsNumber, IsObject, IsOptional, IsString, ValidateNested} from 'class-validator';
import {Type} from "class-transformer";


class Video {
    @IsString()
    url: string;

    @IsString()
    thumbnail: string;
}


export class CreateFudraisingDto {
    @IsOptional()
    @IsString()
    image: string;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => Video)
    video?: Video;

    @IsString()
    title: string;

    @IsString()
    subtitle: string;

    @IsString()
    description: string;

    @IsString()
    category: string;

    @IsString()
    location: string;

    @IsDateString()
    launchDate: Date;

    @IsNumber()
    compaignDuration: number;

    @IsNumber()
    fundingGoal: number;

    @IsOptional()
    @IsString()
    bank: string;

    @IsOptional()
    @IsString()
    bankAccount: string;
}
