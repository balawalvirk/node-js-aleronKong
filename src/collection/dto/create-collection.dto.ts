import { IsEnum, IsString } from 'class-validator';
import { CollectionConditions, CollectionTypes } from 'src/types';

export class CreateCollectionDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString({ each: true })
  media: string[];

  @IsString({ each: true })
  tags: string[];

  @IsEnum(CollectionTypes, { each: true })
  type: string;

  @IsEnum(CollectionConditions, { each: true })
  conditions: string;
}
