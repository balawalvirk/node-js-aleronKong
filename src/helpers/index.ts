import { IQuery } from 'src/types';
export * from './services/base.service';
export * from './services/email.service';
export * from './decorators/match.decorator';
export * from './decorators/user.decorator';
export * from './gateway/socket.gateway';
export * from './pipes/objectId.pipe';
export * from './services/stripe.service';
export * from './interceptors/transform.interceptor';
export * from './decorators/role.decorator';

export const makeQuery = (q: IQuery) => {
  let page = parseInt(q.page) || 1;
  const limit = parseInt(q.limit) || 10;
  if (page === 0) page = 1;
  return {
    limit: limit,
    skip: (page - 1) * limit,
    page: page,
    search: q.search || '',
    sort: { createdAt: -1 },
  };
};
