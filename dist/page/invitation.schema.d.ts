import mongoose from 'mongoose';
import { User } from 'src/users/users.schema';
import { Page } from "src/page/page.schema";
export declare type PageInvitationDocument = PageInvitation & mongoose.Document;
export declare class PageInvitation {
    page: Page;
    friend: User;
    user: User;
    status: string;
}
export declare const PageInvitationSchema: mongoose.Schema<PageInvitation, mongoose.Model<PageInvitation, any, any, any, any>, {}, {}, {}, {}, "type", PageInvitation>;
