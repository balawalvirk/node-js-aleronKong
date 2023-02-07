import { IsMongoId } from 'class-validator';

export class DeleteNotificationDto {
  @IsMongoId({ each: true })
  notifications: string[];
}
