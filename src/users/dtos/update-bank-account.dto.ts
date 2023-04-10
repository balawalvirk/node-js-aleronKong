import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  account_holder_name: string;

  @IsOptional()
  @IsBoolean()
  default_for_currency: boolean;
}
