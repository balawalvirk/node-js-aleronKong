import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Injectable()
export class UploadGuard implements CanActivate {
  public async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const isMultipart = req.isMultipart();
    if (!isMultipart)
      throw new HttpException('multipart/form-data expected.', HttpStatus.BAD_REQUEST);
    const file = await req.file();
    if (!file) throw new HttpException('file expected', HttpStatus.BAD_REQUEST);
    req.incomingFile = file;
    return true;
  }
}
