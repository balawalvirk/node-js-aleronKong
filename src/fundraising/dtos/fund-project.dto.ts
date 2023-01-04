import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class FundProjectDto {
  @IsNumber()
  amount: number;

  @IsString()
  paymentMethod: string;

  @IsMongoId()
  projectId: string;
}
