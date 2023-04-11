import { IsBoolean } from 'class-validator';

export class FeatureUnFeatureDto {
  @IsBoolean()
  featured: boolean;
}
