import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFudraisingDto {
  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  video: string;

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
