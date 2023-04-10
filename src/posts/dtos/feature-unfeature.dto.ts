import { IsBoolean } from 'class-validator';

export class FeatureUnFeatureDto {
  @IsBoolean()
  feature: boolean;
}
