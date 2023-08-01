import { Controller, Get, Post, Body, Param, Delete, Header, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser, ParseObjectId, SocketGateway } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { AGORA_RTC_ROLE, IEnvironmentVariables } from 'src/types';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { AcquireRecordingDto } from './dto/acquire-recording.dto';
import { HttpService } from '@nestjs/axios';
import { StartRecordingDto } from './dto/start-recording.dto';
import { StopRecordingDto } from './dto/stop-recording.dto';

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private readonly socketService: SocketGateway,
    private readonly httpService: HttpService
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
  async remove(@Param('id', ParseObjectId) id: string) {
    const broadcast = await this.broadcastService.deleteSingleRecord({ _id: id });
    this.socketService.triggerMessage('remove-broadcast', broadcast);
    const stop = await this.broadcastService.stopRecording(broadcast.recording.resourceId, broadcast.channel, broadcast.recording.sid);
    const prefix = this.configService.get('S3_URL');
    const url = stop.serverResponse.fileList[0].fileName;
    return `${prefix}${url}`;
  }

  // @Post('/recording/acquire')
  // async acquireRecording(@Body() acquireRecordingDto: AcquireRecordingDto) {
  //   const Authorization = `Basic ${Buffer.from(
  //     `${this.configService.get('AGORA_CUSTOMER_ID')}:${this.configService.get('AGORA_CUSTOMER_SECRET')}`
  //   ).toString('base64')}`;

  //   const acquire = await this.httpService.axiosRef.post(
  //     `https://api.agora.io/v1/apps/${this.configService.get('AGORA_APP_ID')}/cloud_recording/acquire`,
  //     {
  //       cname: acquireRecordingDto.channelName,
  //       uid: acquireRecordingDto.uid,
  //       clientRequest: {
  //         resourceExpiredHour: 24,
  //       },
  //     },
  //     { headers: { Authorization } }
  //   );

  //   return acquire.data;
  // }

  // @Post('/recording/start')
  // async startRecording(@Body() { resourceId, channelName, uid }: StartRecordingDto) {
  //   const customerId = this.configService.get('AGORA_CUSTOMER_ID');
  //   const customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
  //   const appId = this.configService.get('AGORA_APP_ID');
  //   const Authorization = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;
  //   const url = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
  //   const body = {
  //     cname: channelName,
  //     uid: uid,
  //     clientRequest: {
  //       token:
  //         '007eJxTYHj6aS+3xGSdcrVlEtwLtyj5WRU+vu7ydJEfpy/Hwxt8B3QVGIxMki2SUkzMDU2MTU3Skk0sLCyMzc2STExMLVIsUi2NztUdTxHgY2D4rt7AyMjAyMACxPd6jqcwgUlmMMkCJjUYLJMSDc0SzdKMTAwSU1ISDUxNU5LTEpMTjQ2MjQ2TEy2SjMwMEy0t0hgYAKG/MOI=',
  //       recordingFileConfig: {
  //         avFileType: ['mp4', 'hls'],
  //       },
  //       storageConfig: {
  //         vendor: 1,
  //         region: 0,
  //         bucket: this.configService.get('S3_BUCKET_NAME'),
  //         accessKey: this.configService.get('AWS_ACCESS_KEY'),
  //         secretKey: this.configService.get('AWS_SECRET_KEY'),
  //         fileNamePrefix: ['directory1', 'directory2'],
  //       },
  //     },
  //   };
  //   const options = { headers: { Authorization } };
  //   const start = await this.httpService.axiosRef.post(url, body, options);
  //   return start.data;
  // }

  // @Post('recording/stop')
  // async stopRecording(@Body() { sid, resourceId, channelName, uid }: StopRecordingDto) {
  //   const customerId = this.configService.get('AGORA_CUSTOMER_ID');
  //   const customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
  //   const appId = this.configService.get('AGORA_APP_ID');
  //   const Authorization = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;
  //   const url = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
  //   const body = { cname: channelName, uid, clientRequest: {} };
  //   const options = { headers: { Authorization } };
  //   try {
  //     const stop = await this.httpService.axiosRef.post(url, body, options);
  //     return stop.data;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
}
