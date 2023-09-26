import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {User} from 'src/users/users.schema';
import {Page} from "src/page/page.schema";

export type PageModeratorDocument = PageModerator & mongoose.Document;

@Schema({timestamps: true})
export class PageModerator {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true})
    page: Page;


    @Prop()
    nickName: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    user: User;

    @Prop({required: true, default: true})
    createPost: boolean;

    @Prop({required: true, default: true})
    engageAsPage: boolean;

    @Prop({required: true, default: true})
    deletePage: boolean;

    @Prop({required: true, default: true})
    editPage: boolean;
}

export const PageModeratorSchema = SchemaFactory.createForClass(PageModerator);
