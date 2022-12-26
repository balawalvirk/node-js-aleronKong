import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProductStatus, ProductType } from 'src/types';

class Detail {
  @IsString()
  value: string;

  @IsNumber()
  quantity: string;
}

class Attribute {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Detail)
  details: Detail[];
}

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Attribute)
  attributes?: Attribute[];

  @IsOptional()
  @IsString()
  simultaneousDeviceUsage: string;
}
