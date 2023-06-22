import { IsString } from 'class-validator';

export class AcquireRecordingDto {
  @IsString()
  channelName: string;

  @IsString()
  uid: string;
}
