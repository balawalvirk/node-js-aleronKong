import { IQuery } from 'src/types';
export * from './services/base.service';
export * from './services/email.service';
export * from './decorators/match.decorator';
export * from './decorators/user.decorator';
export * from './gateway/socket.gateway';
export * from './pipes/objectId.pipe';
export * from './services/stripe.service';
export * from './interceptors/transform.interceptor';
export * from './decorators/file.decorator';
export * from './guards/upload.guard';

export const makeQuery = (q: IQuery) => {
  const limit = parseInt(q.limit) || 10;
  const page = parseInt(q.page) || 1;
  return {
    limit: limit,
    skip: (page - 1) * limit,
    page: page,
    search: q.search || '',
  };
};
