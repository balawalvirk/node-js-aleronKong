import { IsString, IsDateString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsDateString()
  birthDate: Date;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsBoolean()
  enableNotifications: string;

  @IsOptional()
  @IsBoolean()
  newReleaseNotifications: boolean;

  @IsOptional()
  @IsBoolean()
  newPostsNotifications: boolean;

  @IsOptional()
  @IsBoolean()
  appUpdatesNotifications: boolean;

  @IsOptional()
  @IsBoolean()
  receiveCalls: boolean;

  @IsOptional()
  @IsString()
  shopifyStoreName: string;

  @IsOptional()
  @IsString()
  shopifyAccessToken: string;

  @IsOptional()
  @IsString()
  goLive: boolean;
}
