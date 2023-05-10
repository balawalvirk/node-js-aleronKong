import { IsMongoId } from 'class-validator';

export class CreateShowCaseProductDto {
  @IsMongoId()
  product: string;
}
