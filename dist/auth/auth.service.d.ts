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
