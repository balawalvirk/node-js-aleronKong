import { IsString } from 'class-validator';

export class UpdateBankAccountDto {
  @IsString()
  accountHolderName: string;
}
