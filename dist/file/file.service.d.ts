/// <reference types="multer" />
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
export declare class FileService {
    private readonly configService;
    private readonly s3;
    private readonly bucket;
    constructor(configService: ConfigService<IEnvironmentVariables>);
    getRandomFileName(): string;
    upload(file: Express.Multer.File): Promise<string>;
    delete(Key: string): Promise<void>;
}
