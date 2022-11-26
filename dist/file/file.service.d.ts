/// <reference types="node" />
import { S3 } from 'aws-sdk';
import { MultipartFile } from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
export declare class FileService {
    private readonly configService;
    private readonly s3;
    private readonly bucket;
    constructor(configService: ConfigService<IEnvironmentVariables>);
    upload(file: MultipartFile, privacy: boolean): Promise<S3.ManagedUpload.SendData>;
    download(key: string): import("stream").Readable;
}
