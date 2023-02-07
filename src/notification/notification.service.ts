import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Notification, NotificationDocument } from './notification.schema';

@Injectable()
export class NotificationService extends BaseService<NotificationDocument> {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>) {
    super(notificationModel);
  }

  async find(query: FilterQuery<NotificationDocument>, options?: QueryOptions<NotificationDocument>) {
    return await this.notificationModel.find(query, {}, options).populate({ path: 'sender', select: 'firstName lastName avatar' });
  }
}
