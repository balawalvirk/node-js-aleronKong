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
export declare class PackageController {
    private readonly packageService;
    private readonly stripeService;
    constructor(packageService: PackageService, stripeService: StripeService);
    create(createPackageDto: CreatePackageDto, user: UserDocument): Promise<any>;
    findAll(user: UserDocument): Promise<any[]>;
    update(id: string, updatePackageDto: UpdatePackageDto, user: UserDocument): Promise<any>;
    subscribe(user: UserDocument, id: string): Promise<any>;
    remove(id: string): Promise<any>;
    findAllAuthors(user: UserDocument): Promise<Omit<import("./package.schema").Package & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    unSubscribePackage(id: string, user: UserDocument): Promise<string>;
    findOne(id: string): Promise<any>;
    findMembership(user: UserDocument): Promise<{
        subscription: {
            id: string;
            current_period_end: number;
        };
        invoices: {
            id: string;
            created: number;
            amount_paid: number;
        }[];
    }>;
}
