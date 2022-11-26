import { FilterQuery, Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { GroupDocument } from './group.schema';
export declare class GroupService extends BaseService {
    private groupModel;
    constructor(groupModel: Model<GroupDocument>);
    findOne(query: FilterQuery<any>): Promise<any>;
    findAllMembers(query: FilterQuery<any>): Promise<any>;
    findAllRequests(query: FilterQuery<any>): Promise<any>;
}
