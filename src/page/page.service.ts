import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {FilterQuery, Model} from 'mongoose';
import {BaseService} from 'src/helpers/services/base.service';
import {Page, PageDocument} from './page.schema';

@Injectable()
export class PageService extends BaseService<PageDocument> {
    constructor(@InjectModel(Page.name) private PageModel: Model<PageDocument>) {
        super(PageModel);
    }

    async findAllFollowers(query: FilterQuery<PageDocument>) {
        const pages = await this.PageModel.findOne(query)
            .populate({path: 'followers.follower', select: 'firstName lastName avatar'})
            .populate({path: 'followers.page'})
            .select('followers -_id pageFollwers');
        return pages;
    }
}
