import { IsBoolean } from 'class-validator';

export class PinUnpinDto {
  @IsBoolean()
  pin: boolean;
}
