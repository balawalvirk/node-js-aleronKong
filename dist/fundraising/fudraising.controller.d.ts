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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { CreateFudraisingDto } from './dtos/create-fudraising.dto';
import { PostsService } from 'src/posts/posts.service';
import { StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CreateFudraisingCategoryDto } from './dtos/create-category';
import { CreateFudraisingSubCategoryDto } from './dtos/create-subCategory';
import { FudraisingCategoryService } from './category.service';
import { FudraisingSubCategoryService } from './subcategory.service';
import { FundraisingService } from './fundraising.service';
import { FundProjectDto } from './dtos/fund-project.dto';
import { FindAllFundraisingQueryDto } from './dtos/find-all-query.dto';
import { FundService } from './fund.service';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';
export declare class FundraisingController {
    private readonly postService;
    private readonly categoryService;
    private readonly subCategoryService;
    private readonly fundraisingService;
    private readonly stripeService;
    private readonly fundService;
    private readonly notificationService;
    private readonly firebaseService;
    constructor(postService: PostsService, categoryService: FudraisingCategoryService, subCategoryService: FudraisingSubCategoryService, fundraisingService: FundraisingService, stripeService: StripeService, fundService: FundService, notificationService: NotificationService, firebaseService: FirebaseService);
    createFundraiser(createFudraisingDto: CreateFudraisingDto, user: UserDocument): Promise<{
        message: string;
    }>;
    fundProject({ amount, projectId }: FundProjectDto, user: UserDocument): Promise<import("mongoose").LeanDocument<import("../posts/posts.schema").Posts & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll({ query, page, limit }: FindAllFundraisingQueryDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: (import("./fundraising.schema").Fundraising & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    approve(id: string, user: UserDocument): Promise<{
        message: string;
    }>;
    createCategory(createFudraisingCategoryDto: CreateFudraisingCategoryDto): Promise<import("./category.schema").FundraisingCategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllCategories(): Promise<(import("./category.schema").FundraisingCategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    deleteCategory(id: string): Promise<import("./category.schema").FundraisingCategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createSubCategory(createFudraisingSubCategoryDto: CreateFudraisingSubCategoryDto): Promise<import("./subCategory.schema").FundraisingSubcategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllSubCategories(categoryId: string): Promise<(import("./subCategory.schema").FundraisingSubcategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    deleteSubCategory(id: string): Promise<import("./subCategory.schema").FundraisingSubcategory & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
