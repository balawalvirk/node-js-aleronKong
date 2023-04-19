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
  @IsString()
  shopifyStoreName: string;

  @IsOptional()
  @IsString()
  shopifyAccessToken: string;

  @IsOptional()
  @IsString()
  goLive: boolean;
}
