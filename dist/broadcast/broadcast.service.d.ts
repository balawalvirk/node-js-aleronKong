/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { IEnvironmentVariables } from 'src/types';
import { Broadcast, BroadcastDocument } from './broadcast.schema';
export declare class BroadcastService extends BaseService<BroadcastDocument> {
    private broadcastModel;
    private readonly configService;
    private readonly httpService;
    customerId: string;
    customerSecret: string;
    appId: string;
    Authorization: string;
    bucket: string;
    accessKey: string;
    secretKey: string;
    uid: string;
    constructor(broadcastModel: Model<BroadcastDocument>, configService: ConfigService<IEnvironmentVariables>, httpService: HttpService);
    create(query: FilterQuery<BroadcastDocument>): Promise<Omit<Broadcast & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    uidGenerator(length: number): string;
    acquireRecording(cname: string): Promise<any>;
    startRecording(resourceId: string, cname: string, token: string): Promise<any>;
    stopRecording(resourceId: string, cname: string, sid: string): Promise<any>;
}
