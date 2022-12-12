import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProductStatus, ProductType } from 'src/types';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  media: string[];

  @IsEnum(ProductType)
  type: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  file?: string;

  @IsNumber()
  price: number;

  @IsEnum(ProductStatus)
  status: string;

  @IsOptional()
  @IsNumber()
  quantity: number;

  @IsBoolean()
  syncWithAmazon: boolean;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsMongoId()
  category: string;

  @IsOptional()
  @IsString()
  audioSample?: string;

  @IsOptional()
  @IsString()
  asin?: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: Date;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsBoolean()
  textToSpeech?: boolean;

  @IsOptional()
  @IsBoolean()
  enhancedTypeSetting?: boolean;

  @IsOptional()
  @IsBoolean()
  xRay?: boolean;

  @IsOptional()
  @IsBoolean()
  wordWise?: boolean;

  @IsOptional()
  @IsBoolean()
  lending?: boolean;

  @IsOptional()
  @IsNumber()
  printLength?: number;

  @IsOptional()
  @IsString({ each: true })
  availableColors?: string;

  @IsOptional()
  @IsString({ each: true })
  availableSizes?: string;

  @IsOptional()
  @IsString()
  simultaneousDeviceUsage: string;
}
