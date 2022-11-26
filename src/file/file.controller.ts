import {
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Headers,
  StreamableFile,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileService } from './file.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Headers('host') host: string) {
    const key = this.fileService.getRandomFileName();
    await this.fileService.upload(file, key);
    return { fileUrl: `${host}/v1/file/find-one/${key}` };
  }

  @Post('private/create')
  @UseInterceptors(FileInterceptor('file'))
  async createPrivate(@UploadedFile() file: Express.Multer.File, @Headers('host') host: string) {
    const key = `books/${this.fileService.getRandomFileName()}`;
    await this.fileService.upload(file, key);
    return { fileUrl: `${host}/v1/file/find-one/private/${key}` };
  }

  @Get('find-one/:key')
  async findOne(@Param('key') key: string) {
    const file = await this.fileService.download(key);
    return { file: new StreamableFile(file) };
  }

  /**
   * !TODO add check here for paid users
   */
  @Get('find-one/private/:key')
  async findOnePrivate(@Param('key') key: string, @GetUser() user: UserDocument) {
    const file = await this.fileService.download(key);
    return { file: new StreamableFile(file) };
  }
}
