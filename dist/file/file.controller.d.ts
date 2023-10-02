/// <reference types="multer" />
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
export declare class FileController {
    private readonly fileService;
    private readonly configService;
    constructor(fileService: FileService, configService: ConfigService<IEnvironmentVariables>);
    create(file: Express.Multer.File): Promise<{
        file: string;
    }>;
}
