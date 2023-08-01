import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Page, PageDocument } from './page.schema';

@Injectable()
export class PageService extends BaseService<PageDocument> {
  constructor(@InjectModel(Page.name) private PageModel: Model<PageDocument>) {
    super(PageModel);
  }
}
