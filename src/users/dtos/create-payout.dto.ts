import { IsPositive } from 'class-validator';

export class CreatePayoutDto {
  @IsPositive()
  amount: number;
}
