import { Controller, Get, Post, Body, Param, Delete, Header, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId, SocketGateway } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { AGORA_RTC_ROLE, IEnvironmentVariables, PostPrivacy } from 'src/types';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PostsService } from 'src/posts/posts.service';

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly postService: PostsService,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private readonly socketService: SocketGateway
  ) {}

  @Post('create')
  @Header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  @Header('Expires', '-1')
  @Header('Pragma', 'no-cache')
  async create(@Body() { role }: CreateBroadcastDto, @GetUser() user: UserDocument) {
    const channel = randomBytes(20).toString('hex');
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTime = 3600;
    const privilegeExpiredTs = currentTimestamp + expirationTime;
    const rtcRole = role === AGORA_RTC_ROLE.PUBLISHER ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const token = RtcTokenBuilder.buildTokenWithUid(
      this.configService.get('AGORA_APP_ID'),
      this.configService.get('AGORA_APP_CERTIFICATE'),
      channel,
      '',
      rtcRole,
      expirationTime,
      privilegeExpiredTs
    );
    const broadcast = await this.broadcastService.create({ token, channel, user: user._id });
    this.socketService.triggerMessage('new-broadcast', broadcast);
    const { cname, uid, resourceId } = await this.broadcastService.acquireRecording(broadcast.channel);
    const { sid } = await this.broadcastService.startRecording(resourceId, cname, broadcast.token);
    const updatedBroadcast = await this.broadcastService.findOneRecordAndUpdate(
      { _id: broadcast._id },
      { $set: { recording: { uid, resourceId, sid } } }
    );
    return updatedBroadcast;
  }

  @Get('find-all')
  async findAll() {
    return await this.broadcastService.findAllRecords().sort({ createdAt: -1 }).populate('user');
  }

  @Get(':id/find-one')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.broadcastService.findOneRecord({ _id: id }).populate('user');
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const broadcast = await this.broadcastService.deleteSingleRecord({ _id: id });
    if (!broadcast) throw new BadRequestException('Broadcast does not exists.');
    this.socketService.triggerMessage('remove-broadcast', broadcast);
    const stop = await this.broadcastService.stopRecording(broadcast.recording.resourceId, broadcast.channel, broadcast.recording.sid);
    const prefix = this.configService.get('S3_URL');
    const url = `${prefix}${stop.serverResponse.fileList[0].fileName}`;
    await this.postService.createRecord({ privacy: PostPrivacy.PUBLIC, videos: [url], creator: user._id });
    return broadcast;
  }
}
