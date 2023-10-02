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
export declare class BaseService<T> {
    private model;
    constructor(model: Model<T>);
    createRecord: (data: T | {}) => Promise<import("mongoose").HydratedDocument<T, {}, {}>>;
    insertManyRecords: (data: T | {}) => Promise<import("mongoose").HydratedDocument<import("mongoose").MergeType<import("mongoose").MergeType<T, {} | T>, import("mongoose").RequireOnlyTypedId<T>>, {}, {}>[]>;
    findAllRecords: (filter?: FilterQuery<T>, options?: QueryOptions<T>) => import("mongoose").Query<import("mongoose").HydratedDocument<T, {}, {}>[], import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    findOneRecord: (filter?: FilterQuery<T>) => import("mongoose").Query<import("mongoose").HydratedDocument<T, {}, {}>, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    countRecords: (filter: FilterQuery<T>) => import("mongoose").Query<number, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    findRecordById: (id: string) => import("mongoose").Query<import("mongoose").HydratedDocument<T, {}, {}>, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    deleteSingleRecord: (filter: FilterQuery<T>) => import("mongoose").Query<import("mongoose").HydratedDocument<T, {}, {}>, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    deleteManyRecord: (filter?: FilterQuery<T>) => import("mongoose").Query<import("mongodb").DeleteResult, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    findOneRecordAndUpdate: (filter: FilterQuery<T>, update: UpdateQuery<T>) => import("mongoose").Query<import("mongoose").HydratedDocument<T, {}, {}>, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
    updateManyRecords: (filter?: FilterQuery<T>, update?: UpdateQuery<T>) => import("mongoose").Query<import("mongodb").UpdateResult, import("mongoose").HydratedDocument<T, {}, {}>, {}, T>;
}
