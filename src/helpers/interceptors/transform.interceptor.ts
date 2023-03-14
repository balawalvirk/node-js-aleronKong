import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface Response<T> {
  data?: T;
  message?: string;
  statusCode: number;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        if (!data) {
          throw new HttpException('Record does not exists.', HttpStatus.BAD_REQUEST);
        } else if (data.message && !data.data) {
          if (typeof data.message === 'string') return { statusCode: 200, message: data.message };
          else return { data, statusCode: 200 };
        } else if (data.message && data.data) {
          return { data: data.data, statusCode: 200, message: data.message };
        } else {
          return { data, statusCode: 200 };
        }
      })
    );
  }
}
