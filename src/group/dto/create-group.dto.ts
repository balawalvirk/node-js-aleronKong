import {IsEnum, IsOptional, IsString} from 'class-validator';
import {GroupPrivacy} from 'src/types';

export class CreateGroupDto {
    @IsString()
    @IsOptional()
    coverPhoto: string;

    @IsString()
    @IsOptional()
    profilePhoto: string;

    @IsString()
    description: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    rules?: string;

    @IsEnum(GroupPrivacy)
    privacy: string;


    @IsOptional()
    @IsString()
    coverPhotoRepositioned: string;

}
