import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  media: string[];

  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  file?: string;

  @IsNumber()
  price: number;

  /**
   * todo:need to change this field after confirmation.
   */

  @IsString()
  type: number;

  @IsNumber()
  quantity: number;

  @IsBoolean()
  syncWithAmazon: boolean;
}
