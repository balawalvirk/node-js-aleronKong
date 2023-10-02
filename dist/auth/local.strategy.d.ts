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
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(email: string, password: string): Promise<{
        _id: any;
        role: string[];
        __v?: any;
        id?: any;
        line1: string;
        city: string;
        state: string;
        postalCode: string;
        status: string;
        email: string;
        firstName: string;
        lastName: string;
        userName: string;
        birthDate: Date;
        avatar: string;
        authType: string;
        customerId: string;
        sellerId: string;
        defaultWithDrawAccountId: string;
        defaultPaymentMethod: string;
        defaultAddress: import("../address/address.schema").Address;
        fcmToken: string;
        isGuildMember: boolean;
        friends: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        blockedUsers: import("mongoose").LeanDocument<import("../users/users.schema").User>[];
        supportingPackages: import("mongoose").LeanDocument<import("../package/package.schema").Package>[];
        boughtDigitalProducts: import("mongoose").LeanDocument<import("../product/product.schema").Product>[];
        boughtWebSeries: import("mongoose").LeanDocument<import("../product/product.schema").Product>[];
        enableNotifications: boolean;
        newReleaseNotifications: boolean;
        newPostsNotifications: boolean;
        appUpdatesNotifications: boolean;
        receiveCalls: boolean;
        doNotDisturb: boolean;
        doNotDisturbStartTime: Date;
        doNotDisturbEndTime: Date;
        phoneNumber: string;
        ssnLast4: string;
        ip: string;
        sellerRequest: string;
        shopifyStoreName: string;
        shopifyAccessToken: string;
        goLive: boolean;
        postPrivacy: string;
    }>;
}
export {};
