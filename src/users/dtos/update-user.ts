import {IsString, IsDateString, IsOptional, IsBoolean, IsEnum} from 'class-validator';
import {PostPrivacy} from 'src/types';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;


    @IsOptional()
    @IsString()
    userName?: string;


    @IsOptional()
    @IsDateString()
    birthDate?: Date;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsBoolean()
    enableNotifications?: string;

    @IsOptional()
    @IsBoolean()
    newReleaseNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    newPostsNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    appUpdatesNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    receiveCalls?: boolean;

    @IsOptional()
    @IsString()
    shopifyStoreName?: string;


    @IsOptional()
    @IsString()
    fcmToken?: string;


    @IsOptional()
    @IsString()
    shopifyAccessToken?: string;

    @IsOptional()
    @IsBoolean()
    goLive?: boolean;

    @IsOptional()
    @IsEnum(PostPrivacy, {each: true})
    postPrivacy?: string;
}
