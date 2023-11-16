import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document} from 'mongoose';
import {User} from '../users/users.schema';
import {Guild} from "src/guild/guild.schema";

export type BenefitDocument = Benefit & Document;

@Schema({timestamps: true})
export class Benefit {
    @Prop({required: true})
    label: string;


    @Prop({required: true})
    image: string;



    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    creator: User;




    @Prop({default: Date.now})
    date_created: Date;
}

export const BenefitSchema = SchemaFactory.createForClass(Benefit);
