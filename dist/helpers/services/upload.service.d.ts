import { S3 } from 'aws-sdk';
import { MultipartFile } from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
export declare class FileUploadService {
    private readonly configService;
    private readonly s3;
    constructor(configService: ConfigService<IEnvironmentVariables>);
    upload(file: MultipartFile): Promise<S3.ManagedUpload.SendData>;
    download(): Promise<void>;
}
