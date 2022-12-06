import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
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

  @Put(':id/read')
  async read(@Param('id', ParseObjectId) id: string) {
    return await this.notificationServie.findOneRecordAndUpdate({ _id: id }, { isRead: true });
  }
}
