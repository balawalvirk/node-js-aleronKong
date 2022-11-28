import { IsMongoId, IsString } from 'class-validator';

export class CreateFudraisingSubCategoryDto {
  @IsString()
  title: string;

  @IsMongoId()
  category: string;
}
