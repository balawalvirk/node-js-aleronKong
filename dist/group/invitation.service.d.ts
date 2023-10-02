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
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { GroupInvitation, GroupInvitationDocument } from './invitation.schema';
export declare class GroupInvitationService extends BaseService<GroupInvitationDocument> {
    private groupInvitationModel;
    constructor(groupInvitationModel: Model<GroupInvitationDocument>);
    getPopulateFields(): ({
        path: string;
        select?: undefined;
    } | {
        path: string;
        select: string;
    })[];
    create(query: FilterQuery<GroupInvitationDocument>): Promise<Omit<GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    find(filter: FilterQuery<GroupInvitationDocument>): Promise<Omit<GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    findOneAndUpdate(query: FilterQuery<GroupInvitationDocument>, updateQuery: UpdateQuery<GroupInvitationDocument>): Promise<GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findOne(query: FilterQuery<GroupInvitationDocument>): Promise<GroupInvitation & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
