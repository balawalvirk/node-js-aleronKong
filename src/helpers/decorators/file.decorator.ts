import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const File = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const file = req.incomingFile;
  return file;
});
