import { IsMongoId, IsNumber, IsString } from 'class-validator';

export class FundProjectDto {
  @IsNumber()
  amount: number;

  @IsMongoId()
  projectId: string;
}
