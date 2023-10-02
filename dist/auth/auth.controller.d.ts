/// <reference types="multer" />
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
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { UserDocument } from 'src/users/users.schema';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-pass.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { EmailService } from 'src/helpers/services/email.service';
import { CartService } from 'src/product/cart.service';
import { FileService } from 'src/file/file.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    private readonly emailService;
    private readonly cartService;
    private readonly fileService;
    private readonly configService;
    constructor(authService: AuthService, userService: UsersService, emailService: EmailService, cartService: CartService, fileService: FileService, configService: ConfigService);
    login(user: UserDocument): Promise<{
        access_token: string;
        user: {
            defaultPaymentMethod: any;
            cartItems: number;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            userName: string;
            birthDate: Date;
            avatar: string;
            authType: string;
            role: string[];
            status: string;
            customerId: string;
            sellerId: string;
            defaultWithDrawAccountId: string;
            defaultAddress: import("../address/address.schema").Address;
            fcmToken: string;
            isGuildMember: boolean;
            friends: import("src/users/users.schema").User[];
            blockedUsers: import("src/users/users.schema").User[];
            supportingPackages: import("../package/package.schema").Package[];
            boughtDigitalProducts: import("../product/product.schema").Product[];
            boughtWebSeries: import("../product/product.schema").Product[];
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
            city: string;
            line1: string;
            postalCode: string;
            state: string;
            ip: string;
            sellerRequest: string;
            shopifyStoreName: string;
            shopifyAccessToken: string;
            goLive: boolean;
            postPrivacy: string;
            _id?: any;
            __v?: any;
            $locals: Record<string, unknown>;
            $op: "remove" | "validate" | "save";
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection<import("bson").Document>;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            id?: any;
            isNew: boolean;
            modelName: string;
            schema: import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any>, {}, {}, {}, {}, "type", {
                [x: string]: any;
            }>;
        };
    }>;
    adminLogin(user: UserDocument): Promise<{
        access_token: string;
        user: UserDocument;
    }>;
    register(registerDto: RegisterDto, ip: string, avatar: Express.Multer.File): Promise<{
        message: string;
        data: {
            user: {
                unReadNotifications: number;
                unReadMessages: number;
                cartItems: number;
            };
            access_token: string;
        };
    }>;
    checkEmail(email: string): Promise<{
        message: string;
    }>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<{
        access_token: string;
        user: {
            unReadNotifications: number;
            unReadMessages: number;
            cartItems: number;
        };
        newUser: boolean;
    } | {
        access_token: string;
        user: {
            unReadNotifications: (import("../notification/notification.schema").Notification & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            })[];
            unReadMessages: (import("../notification/notification.schema").Notification & import("mongoose").Document<any, any, any> & {
                _id: import("mongoose").Types.ObjectId;
            })[];
            defaultPaymentMethod: any;
            cartItems: number;
        };
        newUser: boolean;
    }>;
    forgetPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword({ password, otp }: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
