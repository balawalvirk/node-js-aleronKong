import { IsString } from 'class-validator';
import { AcquireRecordingDto } from './acquire-recording.dto';

export class StartRecordingDto extends AcquireRecordingDto {
  @IsString()
  resourceId: string;
}
