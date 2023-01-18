import { IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  rating: number;

  @IsString()
  review: string;

  @IsMongoId()
  product: string;

  @IsOptional()
  @IsMongoId()
  order: string;
}
