import { IsNumber, IsString } from 'class-validator';

export class CreatePackageDto {
  @IsString()
  title: string;

  @IsString()
  media: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;
}
