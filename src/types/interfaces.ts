import { MultipartFields } from '@fastify/multipart';

export interface IQuery {
  page: string;
  limit: string;
  search: string;
}
