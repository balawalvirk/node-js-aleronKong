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
