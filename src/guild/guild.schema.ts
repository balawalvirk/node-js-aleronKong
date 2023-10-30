import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {User} from 'src/users/users.schema';

export type GuildDocument = Guild & mongoose.Document;

@Schema({timestamps: true})
export class Guild {
    @Prop({required: true})
    display_name: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true})
    profile_photo: string;

    @Prop({required: true})
    cover_photo: string;


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    creator: User;


    @Prop({type: Date, default:Date.now})
    date_created: User;
}

export const GuildSchema = SchemaFactory.createForClass(Guild);
