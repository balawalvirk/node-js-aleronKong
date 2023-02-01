import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { NotificationService } from './notification.service';

@Controller('notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationServie: NotificationService) {}

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument) {
    return await this.notificationServie.findAllRecords({ receiver: user._id });
  }

  @Put('read-all')
  async read(@GetUser() user: UserDocument) {
    await this.notificationServie.updateManyRecords({ receiver: user._id }, { isRead: true });
    return { message: 'Notifications read successfully.' };
  }
}
