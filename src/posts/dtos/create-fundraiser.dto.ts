import { IsOptional, IsString } from 'class-validator';

export class CreateFundraiserDto {
  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsString()
  video: string;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
