import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Page } from "src/page/page.schema";
export declare type PageModeratorDocument = PageModerator & mongoose.Document;
export declare class PageModerator {
    page: Page;
    nickName: string;
    user: User;
    createPost: boolean;
    engageAsPage: boolean;
    deletePage: boolean;
    editPage: boolean;
}
export declare const PageModeratorSchema: mongoose.Schema<PageModerator, mongoose.Model<PageModerator, any, any, any, any>, {}, {}, {}, {}, "type", PageModerator>;
