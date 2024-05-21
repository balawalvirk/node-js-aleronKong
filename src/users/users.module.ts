import {forwardRef, Global, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ChatModule} from 'src/chat/chat.module';
import {FirebaseModule} from 'src/firebase/firebase.module';
import {GroupModule} from 'src/group/group.module';
import {SocketGateway, StripeService} from 'src/helpers';
import {NotificationModule} from 'src/notification/notification.module';
import {OrderModule} from 'src/order/order.module';
import {ProductModule} from 'src/product/product.module';
import {User, UserSchema} from 'src/users/users.schema';
import {FriendRequest, FriendRequestSchema} from './friend-request.schema';
import {FriendRequestService} from './friend-request.service';
import {UserController} from './users.controller';
import {UsersService} from './users.service';
import {GuildService} from "src/guild/guild.service";
import {Guild, GuildSchema} from "src/guild/guild.schema";
import {PostsModule} from "src/posts/posts.module";
import {PostsService} from "src/posts/posts.service";
import {Posts, PostSchema} from "src/posts/posts.schema";
import {Page, PageSchema} from "src/page/page.schema";
import {PageService} from "src/page/page.service";
import {AddressService} from "src/address/address.service";
import {Address, AddressSchema} from "src/address/address.schema";
import {BroadcastService} from "src/broadcast/broadcast.service";
import { HttpModule } from '@nestjs/axios';
import {Package, PackageSchema} from "src/package/package.schema";
import {PackageService} from "src/package/package.service";
import {ReviewService} from "src/review/review.service";
import {Review, ReviewSchema} from "src/review/review.schema";
import {ModeratorService} from "src/group/moderator.service";
import {GroupInvitationService} from "src/group/invitation.service";
import {ReactionService} from "src/posts/reaction.service";
import {Moderator, ModeratorSchema} from "src/group/moderator.schema";
import {GroupInvitation, GroupInvitationSchema} from "src/group/invitation.schema";
import {Reaction, ReactionSchema} from "src/posts/reaction.schema";


@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            {name: User.name, schema: UserSchema},
            {name: Guild.name, schema: GuildSchema},
            {name: Posts.name, schema: PostSchema},
            {name: Address.name, schema: AddressSchema},
            {name: Package.name, schema: PackageSchema},
            { name: Review.name, schema: ReviewSchema },
            {name: Moderator.name, schema: ModeratorSchema},
            {name: GroupInvitation.name, schema: GroupInvitationSchema},
            {name: Reaction.name, schema: ReactionSchema}
        ]),
        MongooseModule.forFeature([{name: Page.name, schema: PageSchema}]),
        MongooseModule.forFeature([{name: FriendRequest.name, schema: FriendRequestSchema}]),
        HttpModule,
        NotificationModule,
        FirebaseModule,
        OrderModule,
        ChatModule,
        ProductModule,
        GroupModule
    ],
    controllers: [UserController],
    providers: [UsersService, SocketGateway, StripeService, FriendRequestService, GuildService, PostsService, PageService, AddressService,
        PackageService,ReviewService,ModeratorService,GroupInvitationService,ReactionService],
    exports: [UsersService],
})
export class UsersModule {
}
