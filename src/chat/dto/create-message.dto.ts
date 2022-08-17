import { IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  sender: string;

  @IsString()
  receiver: string;

  @IsString()
  message: string;
}
