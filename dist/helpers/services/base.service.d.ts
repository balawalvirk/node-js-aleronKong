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
export declare class BaseService {
    private model;
    constructor(model: Model<any>);
    createRecord: (data: any) => Promise<any>;
    insertManyRecords: (data: any) => Promise<((import("mongoose").Document<unknown, any, Omit<any, "_id"> & {
        _id: import("mongoose").Types.ObjectId;
    }> & Omit<any, "_id"> & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>) | (import("mongoose").Document<unknown, any, Omit<any, "_id"> & Required<{
        _id: unknown;
    }>> & Omit<any, "_id"> & Required<{
        _id: unknown;
    }> & Required<{
        _id: unknown;
    }>))[]>;
    findAllRecords: (filter?: FilterQuery<any>) => import("mongoose").Query<any[], any, {}, any>;
    findOneRecord: (filter?: FilterQuery<any>) => import("mongoose").Query<any, any, {}, any>;
    paginate: (condition?: FilterQuery<any>, paginate?: {}) => import("mongoose").Query<any[], any, {}, any>;
    countRecords: (filter: FilterQuery<any>) => import("mongoose").Query<number, any, {}, any>;
    findRecordById: (id: string) => import("mongoose").Query<any, any, {}, any>;
    deleteSingleRecord: (filter: FilterQuery<any>) => import("mongoose").Query<any, any, {}, any>;
    deleteManyRecord: (filter?: FilterQuery<any>) => import("mongoose").Query<import("mongodb").DeleteResult, any, {}, any>;
    findOneRecordAndUpdate: (filter: FilterQuery<any>, update: UpdateQuery<any>) => import("mongoose").Query<any, any, {}, any>;
    updateManyRecords: (filter?: FilterQuery<any>, update?: UpdateQuery<any>) => import("mongoose").Query<import("mongodb").UpdateResult, any, {}, any>;
}
