"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const base_service_1 = require("../helpers/services/base.service");
const types_1 = require("../types");
const product_schema_1 = require("./product.schema");
let ProductService = class ProductService extends base_service_1.BaseService {
    constructor(productModel) {
        super(productModel);
        this.productModel = productModel;
    }
    async create(query) {
        return (await this.productModel.create(query)).populate('category creator');
    }
    async find(query, options) {
        return await this.productModel.find(query, {}, options).populate('category');
    }
    async findOne(query) {
        return await this.productModel
            .findOne(query)
            .populate([{ path: 'category' }, { path: 'creator' }, { path: 'series.tracks' }, { path: 'tracks' }]);
    }
    async update(query, updateQuery) {
        return await this.productModel.findOneAndUpdate(query, updateQuery, { new: true }).populate('category creator');
    }
    calculateTax(price, commission) {
        const subTotal = price;
        const tax = Math.round((2 / 100) * subTotal);
        const total = Math.round((subTotal + tax) * 100);
        const applicationFeeAmount = Math.round((commission / 100) * total);
        return { subTotal, tax, total, applicationFeeAmount };
    }
    async findStoreProducts(query, options) {
        return await this.productModel.aggregate([
            { $match: query },
            {
                $sort: !(options === null || options === void 0 ? void 0 : options.sort) ? { createdAt: -1 } : options === null || options === void 0 ? void 0 : options.sort,
            },
            {
                $lookup: {
                    from: 'productcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator',
                },
            },
            { $unwind: '$creator' },
            {
                $group: {
                    _id: '$category._id',
                    category: {
                        $first: '$category.title',
                    },
                    type: {
                        $first: '$$ROOT.type',
                    },
                    products: {
                        $push: '$$ROOT',
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    products: { $slice: ['$products', 10] },
                    type: 1,
                    category: 1,
                    count: 1,
                },
            },
        ]);
    }
    async getSearchProducts() {
        return await this.productModel.aggregate([
            {
                $lookup: {
                    from: 'productcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $facet: {
                    latest: [
                        {
                            $sort: {
                                createdAt: -1,
                            },
                        },
                        {
                            $group: {
                                _id: '$category._id',
                                categoryTitle: {
                                    $first: '$category.title',
                                },
                                type: {
                                    $first: '$$ROOT.type',
                                },
                                products: {
                                    $push: '$$ROOT',
                                },
                                count: {
                                    $sum: 1,
                                },
                                category: {
                                    $first: 'Latest',
                                },
                            },
                        },
                        {
                            $set: {
                                category: {
                                    $concat: ['$category', ' ', '$categoryTitle'],
                                },
                            },
                        },
                    ],
                    trending: [
                        {
                            $sort: {
                                avgRating: -1,
                            },
                        },
                        {
                            $group: {
                                _id: '$category._id',
                                categoryTitle: {
                                    $first: '$category.title',
                                },
                                type: {
                                    $first: '$$ROOT.type',
                                },
                                products: {
                                    $push: '$$ROOT',
                                },
                                count: {
                                    $sum: 1,
                                },
                                category: {
                                    $first: 'Trending',
                                },
                            },
                        },
                        {
                            $set: {
                                category: {
                                    $concat: ['$category', ' ', '$categoryTitle'],
                                },
                            },
                        },
                    ],
                    popular: [
                        {
                            $lookup: {
                                from: 'sales',
                                localField: '_id',
                                foreignField: 'product',
                                as: 'sales',
                            },
                        },
                        {
                            $set: {
                                salesCount: {
                                    $size: '$sales',
                                },
                            },
                        },
                        {
                            $sort: {
                                salesCount: -1,
                            },
                        },
                        {
                            $project: {
                                sales: 0,
                            },
                        },
                        {
                            $group: {
                                _id: '$category._id',
                                categoryTitle: {
                                    $first: '$category.title',
                                },
                                type: {
                                    $first: '$$ROOT.type',
                                },
                                products: {
                                    $push: '$$ROOT',
                                },
                                count: {
                                    $sum: 1,
                                },
                                category: {
                                    $first: 'Most Popular',
                                },
                            },
                        },
                        {
                            $set: {
                                category: {
                                    $concat: ['$category', ' ', '$categoryTitle'],
                                },
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    latest: {
                        $map: {
                            input: '$latest',
                            as: 'latest',
                            in: {
                                category: '$$latest.category',
                                count: '$$latest.count',
                                type: '$$latest.type',
                                products: {
                                    $slice: ['$$latest.products', 10],
                                },
                            },
                        },
                    },
                    popular: {
                        $map: {
                            input: '$popular',
                            as: 'popular',
                            in: {
                                _id: 0,
                                category: '$$popular.category',
                                count: '$$popular.count',
                                type: '$$popular.type',
                                products: {
                                    $slice: ['$$popular.products', 10],
                                },
                            },
                        },
                    },
                    trending: {
                        $map: {
                            input: '$trending',
                            as: 'trending',
                            in: {
                                _id: 0,
                                categoryTitle: 0,
                                category: '$$trending.category',
                                count: '$$trending.count',
                                type: '$$trending.type',
                                products: {
                                    $slice: ['$$trending.products', 10],
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    products: {
                        $concatArrays: ['$trending', '$popular', '$latest'],
                    },
                },
            },
        ]);
    }
    async getBoughtProducts(query, sort) {
        return await this.productModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'tracks',
                    localField: 'tracks',
                    foreignField: '_id',
                    as: 'tracks',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'creator',
                    foreignField: '_id',
                    as: 'creator',
                },
            },
            {
                $unwind: {
                    path: '$creator',
                },
            },
            {
                $lookup: {
                    from: 'productcategories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: {
                    path: '$category',
                },
            },
            {
                $group: {
                    _id: '$creator._id',
                    authorFirstName: {
                        $first: '$creator.firstName',
                    },
                    authorLastName: {
                        $first: '$creator.lastName',
                    },
                    products: {
                        $push: '$$ROOT',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: sort,
            },
        ]);
    }
    getBoughtProductsSorting(sort) {
        if (sort === types_1.BoughtProductsSort.TITLE) {
            return { 'products.title': 1 };
        }
        else if (sort === types_1.BoughtProductsSort.AUTHOR) {
            return { 'products.authorFirstName': 1, 'products.authorLastName': 1 };
        }
        else if (sort === types_1.BoughtProductsSort.UNREAD) {
            return { 'products.tracks.page': 1 };
        }
        else {
            return { 'products.tracks.isCompleted': -1, 'products.tracks.updatedAt': -1 };
        }
    }
};
ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map