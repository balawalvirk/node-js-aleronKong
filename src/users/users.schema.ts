import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document} from 'mongoose';
import {Address} from 'src/address/address.schema';
import {Package} from 'src/package/package.schema';
import {Product} from 'src/product/product.schema';
import {AuthTypes, PostPrivacy, SellerRequest, UserRoles, UserStatus} from 'src/types';

export type UserDocument = User & Document;

@Schema({timestamps: true})
export class User {
    @Prop({required: true, lowercase: true, trim: true})
    email: string;

    @Prop({required: true})
    password: string;

    @Prop({trim: true})
    firstName: string;

    @Prop({trim: true})
    lastName: string;

    @Prop({trim: true})
    userName: string;

    @Prop()
    birthDate: Date;

    @Prop()
    avatar: string;

    @Prop({default: AuthTypes.LOCAL, enum: AuthTypes})
    authType: string;

    @Prop({default: [UserRoles.CUSTOMER], enum: UserRoles, type: [String]})
    role: string[];

    @Prop({default: UserStatus.ACTIVE, enum: UserStatus})
    status: string;

    //stripe customer id
    @Prop()
    customerId: string;

    //stripe connect(express) account id
    @Prop()
    sellerId: string;

    @Prop()
    defaultWithDrawAccountId: string;

    @Prop()
    defaultPaymentMethod: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Address'})
    defaultAddress: Address;

    @Prop()
    fcmToken: string;

    @Prop({default: false})
    isGuildMember: boolean;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]})
    friends: User[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]})
    blockedUsers: User[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Package'}]})
    supportingPackages: Package[];

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}]})
    boughtDigitalProducts: Product[];

    // all ids of products whose web series are bought by me
    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}]})
    boughtWebSeries: Product[];

    @Prop({default: true})
    enableNotifications: boolean;

    @Prop({default: true})
    newReleaseNotifications: boolean;

    @Prop({default: true})
    newPostsNotifications: boolean;

    @Prop({default: true})
    appUpdatesNotifications: boolean;

    @Prop({default: false})
    receiveCalls: boolean;

    @Prop({default: false})
    doNotDisturb: boolean;

    @Prop()
    doNotDisturbStartTime: Date;

    @Prop()
    doNotDisturbEndTime: Date;

    @Prop()
    phoneNumber: string;

    @Prop()
    ssnLast4: string;

    @Prop()
    city: string;

    @Prop()
    line1: string;

    @Prop()
    postalCode: string;

    @Prop()
    state: string;

    @Prop()
    ip: string;

    @Prop({enum: SellerRequest})
    sellerRequest: string;

    @Prop()
    shopifyStoreName: string;

    @Prop()
    shopifyAccessToken: string;

    @Prop()
    goLive: boolean;

    @Prop({default: PostPrivacy.PUBLIC})
    postPrivacy: string;


    @Prop({ default: "user"})
    type: string;

}

export const UserSchema = SchemaFactory.createForClass(User);
