import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { ChatMuteType } from 'src/types';

export class MuteChatDto {
  @IsMongoId()
  chat: string;

  @IsMongoId()
  mutedBy: string;

  @IsEnum(ChatMuteType, { each: true })
  muteType: string;

  @IsOptional()
  @IsDateString()
  startTime?: Date;

  @IsOptional()
  @IsDateString()
  endTime?: Date;
}
