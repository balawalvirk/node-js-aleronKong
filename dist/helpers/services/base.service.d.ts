import { FilterQuery, Model, UpdateQuery } from 'mongoose';
export declare class BaseService {
    private model;
    constructor(model: Model<any>);
    createRecord: (data: any) => Promise<any>;
    insertManyRecords: (data: any) => Promise<((import("mongoose").Document<unknown, any, Omit<any, "_id"> & Required<{
        _id: unknown;
    }>> & Omit<any, "_id"> & Required<{
        _id: unknown;
    }> & Required<{
        _id: unknown;
    }>) | (import("mongoose").Document<unknown, any, Omit<any, "_id"> & {
        _id: import("mongoose").Types.ObjectId;
    }> & Omit<any, "_id"> & {
        _id: import("mongoose").Types.ObjectId;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
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
