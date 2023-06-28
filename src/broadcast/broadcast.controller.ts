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
    const broadcast = await this.broadcastService.create({ token, channel, user: user._id });
    this.socketService.triggerMessage('new-broadcast', broadcast);
    return broadcast;
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
    return broadcast;
  }

  @Post('/recording/acquire')
  async acquireRecording(@Body() acquireRecordingDto: AcquireRecordingDto) {
    const Authorization = `Basic ${Buffer.from(
      `${this.configService.get('AGORA_CUSTOMER_ID')}:${this.configService.get('AGORA_CUSTOMER_SECRET')}`
    ).toString('base64')}`;

    const acquire = await this.httpService.axiosRef.post(
      `https://api.agora.io/v1/apps/${this.configService.get('AGORA_APP_ID')}/cloud_recording/acquire`,
      {
        cname: acquireRecordingDto.channelName,
        uid: acquireRecordingDto.uid,
        clientRequest: {
          resourceExpiredHour: 24,
        },
      },
      { headers: { Authorization } }
    );

    return acquire.data;
  }

  @Post('/recording/start')
  async startRecording(@Body() { resourceId, channelName, uid }: StartRecordingDto) {
    const customerId = this.configService.get('AGORA_CUSTOMER_ID');
    const customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
    const appId = this.configService.get('AGORA_APP_ID');
    const Authorization = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;
    const url = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
    const body = {
      cname: channelName,
      uid: uid,
      clientRequest: {
        recordingConfig: {
          maxIdleTime: 30,
          streamTypes: 2,
          channelType: 0,
          videoStreamType: 0,
          transcodingConfig: {
            height: 640,
            width: 360,
            bitrate: 500,
            fps: 15,
            mixedVideoLayout: 1,
            backgroundColor: '#FFFFFF',
          },
        },
        recordingFileConfig: {
          avFileType: ['hls'],
        },
        storageConfig: {
          vendor: 1,
          region: 0,
          bucket: this.configService.get('S3_BUCKET_NAME'),
          accessKey: this.configService.get('AWS_ACCESS_KEY'),
          secretKey: this.configService.get('AWS_SECRET_KEY'),
          fileNamePrefix: ['directory1', 'directory2'],
        },
      },
    };
    const options = { headers: { Authorization } };

    const start = await this.httpService.axiosRef.post(url, body, options);
    return start.data;
  }

  @Post('recording/stop')
  async stopRecording(@Body() { sid, resourceId, channelName, uid }: StopRecordingDto) {
    const customerId = this.configService.get('AGORA_CUSTOMER_ID');
    const customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
    const appId = this.configService.get('AGORA_APP_ID');
    const Authorization = `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`;
    const url = `https://api.agora.io/v1/apps/${appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
    const body = { cname: channelName, uid, clientRequest: {} };
    const options = { headers: { Authorization } };
    const stop = await this.httpService.axiosRef.post(url, body, options);
    return stop.data;
  }
}
