import {Body, Controller, Delete, Get, Param, Put, Query, UseGuards} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {GetUser, makeQuery, ParseObjectId} from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { DeleteNotificationDto } from './dto/delete-notification.dto';
import { FindAllNotificationsQueryDto } from './dto/find-all-notifications.query.dto';
import { NotificationService } from './notification.service';
import mongoose from "mongoose";

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument, @Query() { page, limit,pageId }: FindAllNotificationsQueryDto) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    let condition:any = { receiver: user._id };

    if(pageId){
        condition = { page:new mongoose.Types.ObjectId(pageId) };
    }

    await this.notificationService.updateManyRecords({ receiver: user._id, isRead: false }, { isRead: true });
    const notifications = await this.notificationService.find(condition, options);
    const total = await this.notificationService.countRecords(condition);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: notifications,
    };
    return paginated;
  }

  @Put('delete')
  async delete(@Body() deleteNotificationDto: DeleteNotificationDto) {
    await this.notificationService.deleteManyRecord({ _id: { $in: deleteNotificationDto.notifications } });
    return { message: 'Notifications deleted successfully.' };
  }

  @Delete('delete-all')
  async deleteAll(@GetUser() user: UserDocument) {
    await this.notificationService.deleteManyRecord({ receiver: user._id });
    return { message: 'Notifications deleted successfully.' };
  }



    @Delete('delete-all/page/:page')
    async deleteAllPageNotifications(@GetUser() user: UserDocument,@Param('page') pageId: string) {
        await this.notificationService.deleteManyRecord({ page: new mongoose.Types.ObjectId(pageId) });
        return { message: 'Notifications deleted successfully.' };
    }

}
