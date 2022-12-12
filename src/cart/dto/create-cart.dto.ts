import { IsMongoId, IsNumber, IsOptional } from 'class-validator';

export class CreateCartDto {
  @IsMongoId()
  item: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}
