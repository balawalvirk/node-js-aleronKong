import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class SearchService {
  getSorting(sort: string, model: string): { [key: string]: mongoose.SortOrder | { $meta: 'textScore' } } {
    if (model === 'user') {
      if (sort === 'name') {
        return { firstName: -1, lastName: -1 };
      } else return { createdAt: -1 };
    } else if (model === 'product') {
      if (sort === 'name') {
        return { title: -1 };
      } else return { createdAt: -1 };
    } else if (model === 'group') {
      if (sort === 'name') {
        return { name: -1 };
      } else return { createdAt: -1 };
    }
  }
}
