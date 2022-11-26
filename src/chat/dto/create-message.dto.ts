import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateMessageDto {
  @IsString()
  content: string;

  @IsMongoId()
  chat: string;

  @IsOptional()
  @IsString()
  gif?: string;

  @IsOptional()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
