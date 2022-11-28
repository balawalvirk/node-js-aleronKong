import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateFudraisingDto {
  @IsOptional()
  @IsString()
  productImage: string;

  @IsOptional()
  @IsString()
  productvideo: string;

  @IsString()
  projectTitle: string;

  @IsString()
  projectSubtitle: string;

  @IsString()
  projectDescription: string;

  @IsString()
  projectCategory: string;

  @IsString()
  projectSubCategory: string;

  @IsString()
  projectLocation: string;

  @IsDateString()
  projectLaunchDate: Date;

  @IsNumber()
  projectCompaignDuration: number;

  @IsNumber()
  projectFundingGoal: number;

  @IsString()
  projectBank: string;

  @IsString()
  projectBankAccount: string;
}
