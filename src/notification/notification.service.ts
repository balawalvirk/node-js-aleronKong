import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService extends BaseService<NotificationDocument> {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {
    super(notificationModel);
  }
}
