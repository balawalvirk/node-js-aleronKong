import { Controller, Get, Post, Body, Param, Delete, Header, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { AGORA_RTC_ROLE, IEnvironmentVariables } from 'src/types';
import { ConfigService } from '@nestjs/config';

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService, private readonly configService: ConfigService<IEnvironmentVariables>) {}

  @Post('create')
  @Header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  @Header('Expires', '-1')
  @Header('Pragma', 'no-cache')
  async create(@Body() { role }: CreateBroadcastDto, @GetUser() user: UserDocument) {
    const channel = 'main';
    const uid = '';
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTime = 3600;
    const privilegeExpiredTs = currentTimestamp + expirationTime;
    const rtcRole = role === AGORA_RTC_ROLE.PUBLISHER ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const token = RtcTokenBuilder.buildTokenWithUid(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channel,
      uid,
      rtcRole,
      expirationTime,
      privilegeExpiredTs
    );

    return await this.broadcastService.createRecord({ token, channel, user: user._id });
  }

  @Get('find-all')
  async findAll() {
    return await this.broadcastService.findAllRecords().sort({ createdAt: -1 });
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectId) id: string) {
    return await this.broadcastService.deleteSingleRecord({ _id: id });
  }
}