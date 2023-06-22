import { IsString } from 'class-validator';
import { StartRecordingDto } from './start-recording.dto';

export class StopRecordingDto extends StartRecordingDto {
  @IsString()
  sid: string;
}
