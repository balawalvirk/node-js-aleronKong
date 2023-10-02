import mongoose, { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { Product, ProductDocument } from './product.schema';
export declare class ProductService extends BaseService<ProductDocument> {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    create(query: FilterQuery<ProductDocument>): Promise<Omit<Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>>;
    find(query: FilterQuery<ProductDocument>, options?: QueryOptions<ProductDocument>): Promise<Omit<Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>[]>;
    findOne(query: FilterQuery<ProductDocument>): Promise<Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    update(query: FilterQuery<ProductDocument>, updateQuery: UpdateQuery<ProductDocument>): Promise<Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    calculateTax(price: number, commission: number): {
        subTotal: number;
        tax: number;
        total: number;
        applicationFeeAmount: number;
    };
    findStoreProducts(query: FilterQuery<ProductDocument>, options?: QueryOptions<ProductDocument>): Promise<any[]>;
    getSearchProducts(): Promise<any[]>;
    getBoughtProducts(query: FilterQuery<ProductDocument>, sort: any): Promise<any[]>;
    getBoughtProductsSorting(sort: string): {
        'products.title': number;
        'products.authorFirstName'?: undefined;
        'products.authorLastName'?: undefined;
        'products.tracks.page'?: undefined;
        'products.tracks.isCompleted'?: undefined;
        'products.tracks.updatedAt'?: undefined;
    } | {
        'products.authorFirstName': number;
        'products.authorLastName': number;
        'products.title'?: undefined;
        'products.tracks.page'?: undefined;
        'products.tracks.isCompleted'?: undefined;
        'products.tracks.updatedAt'?: undefined;
    } | {
        'products.tracks.page': number;
        'products.title'?: undefined;
        'products.authorFirstName'?: undefined;
        'products.authorLastName'?: undefined;
        'products.tracks.isCompleted'?: undefined;
        'products.tracks.updatedAt'?: undefined;
    } | {
        'products.tracks.isCompleted': number;
        'products.tracks.updatedAt': number;
        'products.title'?: undefined;
        'products.authorFirstName'?: undefined;
        'products.authorLastName'?: undefined;
        'products.tracks.page'?: undefined;
    };
}
