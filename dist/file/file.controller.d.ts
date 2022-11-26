import { StreamableFile } from '@nestjs/common';
import { FileService } from './file.service';
import { MultipartFile } from '@fastify/multipart';
export declare class FileController {
    private readonly fileService;
    constructor(fileService: FileService);
    create(file: MultipartFile, host: string, isPrivate: boolean): Promise<{
        fileUrl: string;
    }>;
    findOne(key: string): Promise<{
        file: StreamableFile;
    }>;
}
