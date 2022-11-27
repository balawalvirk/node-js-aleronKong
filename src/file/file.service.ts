import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { IEnvironmentVariables } from 'src/types';

@Injectable()
export class FileService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  constructor(private readonly configService: ConfigService<IEnvironmentVariables>) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
      },
      region: this.configService.get('AWS_REGION'),
    });
    this.bucket = this.configService.get('S3_BUCKET_NAME');
  }

  getRandomFileName() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
    const random = ('' + Math.random()).substring(2, 8);
    const random_number = timestamp + random;
    return random_number;
  }

  async upload(file: Express.Multer.File) {
    const Key = this.getRandomFileName();
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await this.s3.send(command);
    return Key;
  }
}
