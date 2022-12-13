import { IsNumber, IsString } from 'class-validator';

export class CreateGuildPackageDto {
  @IsString()
  title: string;

  @IsString()
  image: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;
}
