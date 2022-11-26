import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { PostDocument, Posts } from './posts.schema';
export declare class PostsService extends BaseService {
    private postModel;
    constructor(postModel: Model<PostDocument>);
    findAllPosts(query: any): Promise<Posts[]>;
    updatePost(postId: string, query: any): Promise<Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
