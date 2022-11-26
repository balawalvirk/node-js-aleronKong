import mongoose, { Document } from 'mongoose';
import { User } from './users.schema';
export declare type AddressDocument = Address & Document;
export declare class Address {
    label: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    creator: User;
}
export declare const AddressSchema: mongoose.Schema<Address, mongoose.Model<Address, any, any, any, any>, {}, {}, {}, {}, "type", Address>;
