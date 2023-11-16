import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Guild} from "src/guild/guild.schema";
import {Product} from "src/product/product.schema";
import {Item, ItemSchema} from "src/product/cart.schema";

export type PackageDocument = Package & mongoose.Document;



@Schema({ versionKey: false, _id: false })
export class Buyer {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user;

    @Prop({ type:Date,default: Date.now })
    date_created;
}

export const BuyerSchema = SchemaFactory.createForClass(Buyer);



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


    @Prop({ type: [BuyerSchema] })
    buyers: Buyer[];



    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Guild'})
    guild: Guild;




}

export const PackageSchema = SchemaFactory.createForClass(Package);
