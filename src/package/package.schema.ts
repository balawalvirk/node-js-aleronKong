import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Guild} from "src/guild/guild.schema";

export type PackageDocument = Package & mongoose.Document;

@Schema({timestamps: true})
export class Package {
    @Prop({required: true})
    title: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true})
    price: number;

    @Prop({required: true})
    media: string;

    //stripe price id
    @Prop({required: true})
    priceId: string;

    //stripe product id
    @Prop({required: true})
    productId: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    creator: User;

    @Prop({default: false})
    isGuildPackage: boolean;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}]})
    buyers: User[];


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Guild'})
    guild: Guild;


    @Prop({default: false})
    isEligible: boolean;


    @Prop({default: false})
    benefitDelivered: boolean;


    @Prop({type: [{type: String, default:[]}]})
    benefits:String[];


}

export const PackageSchema = SchemaFactory.createForClass(Package);
