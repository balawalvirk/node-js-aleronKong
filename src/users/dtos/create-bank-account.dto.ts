import { IsString } from 'class-validator';

export class CreateBankAccountDto {
  @IsString()
  accountHolderName: string;

  @IsString()
  accountNumber: string;

  @IsString()
  routingNumber: string;
}
