import { S3 } from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';

@Injectable()
export class FileService {
  private readonly s3: S3;
  private readonly bucket: string;
  constructor(private readonly configService: ConfigService<IEnvironmentVariables>) {
    this.s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('S3_BUCKET_NAME');
  }

  async upload(file: MultipartFile, privacy: boolean) {
    let Key: string;
    if (privacy) {
      Key = `books/${file.filename}`;
    } else {
      file.filename;
    }
    return await this.s3
      .upload({
        Bucket: this.bucket,
        Key: Key,
        Body: file.file,
      })
      .promise();
  }

  download(key: string) {
    return this.s3.getObject({ Bucket: this.bucket, Key: key }).createReadStream();
  }
}
