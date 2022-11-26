/// <reference types="multer" />
import { StreamableFile } from '@nestjs/common';
import { FileService } from './file.service';
import { UserDocument } from 'src/users/users.schema';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    create(file: Express.Multer.File, host: string): Promise<{
        fileUrl: string;
    }>;
    createPrivate(file: Express.Multer.File, host: string): Promise<{
        fileUrl: string;
    }>;
    findOne(key: string): Promise<{
        file: StreamableFile;
    }>;
    findOnePrivate(key: string, user: UserDocument): Promise<{
        file: StreamableFile;
    }>;
}
