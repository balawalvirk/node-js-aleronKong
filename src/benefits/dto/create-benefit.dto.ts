import { IsString } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  label: string;
}
