import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
        if (data.message && !data.data) {
          return { statusCode: 200, message: data.message };
        } else if (data.message && data.data) {
          return { data: data.data, statusCode: 200, message: data.message };
        } else if (!data) {
          return { data: null, statusCode: 400 };
        } else {
          return { data, statusCode: 200 };
        }
      })
    );
  }
}
