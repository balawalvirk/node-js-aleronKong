import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { IEnvironmentVariables } from 'src/types';
import { Broadcast, BroadcastDocument } from './broadcast.schema';

@Injectable()
export class BroadcastService extends BaseService<BroadcastDocument> {
  customerId: string;
  customerSecret: string;
  appId: string;
  Authorization: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  uid: string;

  constructor(
    @InjectModel(Broadcast.name) private broadcastModel: Model<BroadcastDocument>,
    private readonly configService: ConfigService<IEnvironmentVariables>,
    private readonly httpService: HttpService
  ) {
    super(broadcastModel);
    this.customerId = this.configService.get('AGORA_CUSTOMER_ID');
    this.customerSecret = this.configService.get('AGORA_CUSTOMER_SECRET');
    this.appId = this.configService.get('AGORA_APP_ID');
    this.Authorization = `Basic ${Buffer.from(`${this.customerId}:${this.customerSecret}`).toString('base64')}`;
    this.bucket = this.configService.get('S3_BUCKET_NAME');
    this.accessKey = this.configService.get('AWS_ACCESS_KEY');
    this.secretKey = this.configService.get('AWS_SECRET_KEY');
    this.uid = '12345';
  }

  async create(query: FilterQuery<BroadcastDocument>) {
    return (await this.broadcastModel.create(query)).populate('user');
  }

  uidGenerator(length: number) {
    return randomBytes(length).toString('hex');
  }

  async acquireRecording(cname: string) {
    try {
      const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/acquire`;
      const options = { headers: { Authorization: this.Authorization } };
      const body = {
        cname,
        uid: this.uid,
        clientRequest: {
          resourceExpiredHour: 24,
        },
      };
      const acquire = await this.httpService.axiosRef.post(url, body, options);
      return acquire.data;
    } catch (error) {
      console.log(error);
    }
  }

  async startRecording(resourceId: string, cname: string, token: string) {
    try {
      const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/resourceid/${resourceId}/mode/mix/start`;
      const body = {
        cname,
        uid: this.uid,
        clientRequest: {
          token,
          recordingFileConfig: {
            avFileType: ['mp4', 'hls'],
          },
          storageConfig: {
            vendor: 1,
            region: 0,
            bucket: this.bucket,
            accessKey: this.accessKey,
            secretKey: this.secretKey,
            fileNamePrefix: ['recordings'],
          },
        },
      };
      const options = { headers: { Authorization: this.Authorization } };
      const start = await this.httpService.axiosRef.post(url, body, options);
      return start.data;
    } catch (error) {
      console.log(error);
    }
  }

  async stopRecording(resourceId: string, cname: string, sid: string) {
    try {
      const url = `https://api.agora.io/v1/apps/${this.appId}/cloud_recording/resourceid/${resourceId}/sid/${sid}/mode/mix/stop`;
      const body = { cname, uid: this.uid, clientRequest: {} };
      const options = { headers: { Authorization: this.Authorization } };
      const stop = await this.httpService.axiosRef.post(url, body, options);
      return stop.data;
    } catch (error) {
      console.log(error);
    }
  }
}
