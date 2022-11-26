import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Headers,
  StreamableFile,
  Body,
} from '@nestjs/common';
import { FileService } from './file.service';
import { File, UploadGuard } from 'src/helpers';
import { MultipartFile } from '@fastify/multipart';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('create')
  @UseGuards(UploadGuard)
  async create(
    @File() file: MultipartFile,
    @Headers('host') host: string,
    @Body('isPrivate') isPrivate: boolean
  ) {
    const s3Object = await this.fileService.upload(file, isPrivate === true ? true : false);
    return { fileUrl: `${host}/v1/file/find-one/${s3Object.Key}` };
  }

  @Get('find-one/:key')
  async findOne(@Param('key') key: string) {
    const file = this.fileService.download(key);
    return { file: new StreamableFile(file) };
  }
}
