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
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { FindAllPackagesQueryDto } from './dto/find-all-query.dto';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';
export declare class PackageController {
    private readonly packageService;
    private readonly stripeService;
    private readonly userService;
    private readonly notificationService;
    private readonly firebaseService;
    constructor(packageService: PackageService, stripeService: StripeService, userService: UsersService, notificationService: NotificationService, firebaseService: FirebaseService);
    create(createPackageDto: CreatePackageDto, user: UserDocument): Promise<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllPackages({ page, limit, query, ...rest }: FindAllPackagesQueryDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: (import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    update(id: string, updatePackageDto: UpdatePackageDto, user: UserDocument): Promise<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    subscribe(user: UserDocument, id: string): Promise<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    remove(id: string, user: UserDocument): Promise<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAllAuthors(user: UserDocument): Promise<Omit<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    unSubscribePackage(id: string, user: any): Promise<string>;
    findOne(id: string): Promise<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findMembership(user: UserDocument, id: string): Promise<{
        invoices: {
            created: number;
            amountPaid: number;
        }[];
        nextPaymentDuo: number;
        _id: any;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        title: string;
        description: string;
        price: number;
        media: string;
        priceId: string;
        productId: string;
        isGuildPackage: boolean;
        buyers: import("mongoose").LeanDocument<import("src/users/users.schema").User>[];
    }>;
}
