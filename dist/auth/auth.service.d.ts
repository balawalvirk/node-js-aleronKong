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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FilterQuery, Model } from 'mongoose';
import { IEnvironmentVariables } from 'src/types';
import { UsersService } from '../users/users.service';
import { Otp, OtpDocument } from './otp.schema';
export declare class AuthService {
    private usersService;
    private jwtService;
    private configService;
    private otpModal;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService<IEnvironmentVariables>, otpModal: Model<OtpDocument>);
    validateUser(email: string, pass: string): Promise<any>;
    login(userName: string, userId: string): Promise<{
        access_token: string;
    }>;
    AddMinutesToDate(date: Date, minutes: number): Date;
    createOtp(body: any): Promise<Otp & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findOneOtp(filter?: FilterQuery<any>): Promise<Otp & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
}
