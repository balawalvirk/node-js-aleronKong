import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PageDocument } from './page.schema';
export declare class PageService extends BaseService<PageDocument> {
    private PageModel;
    constructor(PageModel: Model<PageDocument>);
    findAllFollowers(query: FilterQuery<PageDocument>): Promise<import("./page.schema").Follower[]>;
}
