import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class UploadGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
