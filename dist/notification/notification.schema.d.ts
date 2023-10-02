import * as mongoose from 'mongoose';
import { Group } from 'src/group/group.schema';
import { Order } from 'src/order/order.schema';
import { Comment } from 'src/posts/comment.schema';
import { Posts } from 'src/posts/posts.schema';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/users.schema';
import { Page } from "src/page/page.schema";
import { PageInvitation } from "src/page/invitation.schema";
export declare type NotificationDocument = Notification & mongoose.Document;
export declare class Notification {
    sender: User;
    receiver: User;
    page: Page;
    type: string;
    message: string;
    isRead: boolean;
    post: Posts;
    invitation: PageInvitation;
    user: User;
    order: Order;
    product: Product;
    group: Group;
    comment: Comment;
}
export declare const NotificationSchema: mongoose.Schema<Notification, mongoose.Model<Notification, any, any, any, any>, {}, {}, {}, {}, "type", Notification>;
