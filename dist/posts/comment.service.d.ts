/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Comment, CommentDocument } from './comment.schema';
export declare class CommentService extends BaseService<CommentDocument> {
    private commentModel;
    constructor(commentModel: Model<CommentDocument>);
    create(query: FilterQuery<CommentDocument>): Promise<Omit<Comment & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    getRepliesPopulateFields(): {
        path: string;
        options: {
            sort: {
                createdAt: number;
            };
        };
        populate: ({
            path: string;
            select: string;
            populate?: undefined;
        } | {
            path: string;
            populate: {
                path: string;
                select: string;
            };
            select?: undefined;
        })[];
    };
    find(query: FilterQuery<CommentDocument>, options?: QueryOptions<CommentDocument>): Promise<Omit<Comment & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    update(query: FilterQuery<CommentDocument>, updateQuery: UpdateQuery<CommentDocument>): Promise<Comment & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
