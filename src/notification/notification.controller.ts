import { Body, Controller, Delete, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, makeQuery } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { DeleteNotificationDto } from './dto/delete-notification.dto';
import { FindAllNotificationsQueryDto } from './dto/find-all-notifications.query.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument, @Query() { page, limit,pageId }: FindAllNotificationsQueryDto) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const condition = { receiver: user._id,page:pageId };
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
}
