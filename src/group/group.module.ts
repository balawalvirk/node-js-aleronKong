import {forwardRef, Module} from '@nestjs/common';
import {GroupService} from './group.service';
import {GroupController} from './group.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Group, GroupSchema} from './group.schema';
import {PostsModule} from 'src/posts/posts.module';
import {FundraisingModule} from 'src/fundraising/fudraising.module';
import {NotificationModule} from 'src/notification/notification.module';
import {FirebaseModule} from 'src/firebase/firebase.module';
import {Moderator, ModeratorSchema} from './moderator.schema';
import {ModeratorService} from './moderator.service';
import {MuteModule} from 'src/mute/mute.module';
import {GroupInvitation, GroupInvitationSchema} from './invitation.schema';
import {GroupInvitationService} from './invitation.service';
import {ReportModule} from 'src/report/report.module';
import {PageModule} from 'src/page/page.module';
import {OrderModule} from "src/order/order.module";
import {ChatModule} from "src/chat/chat.module";
import {ProductModule} from "src/product/product.module";
import {CartService} from "src/product/cart.service";
import {Cart, CartSchema} from "src/product/cart.schema";
import {SocketGateway} from "src/helpers";

@Module({
    imports: [
        MongooseModule.forFeature([{name: Group.name, schema: GroupSchema}]),
        MongooseModule.forFeature([{name: Moderator.name, schema: ModeratorSchema}]),
        MongooseModule.forFeature([{name: GroupInvitation.name, schema: GroupInvitationSchema}]),
        MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),

        forwardRef(() => PostsModule),
        FundraisingModule,
        NotificationModule,
        FirebaseModule,
        MuteModule,
        ReportModule,
        PageModule,
        OrderModule,
        ChatModule,
        ProductModule,

    ],
    controllers: [GroupController],
    providers: [GroupService, ModeratorService,CartService, GroupInvitationService,SocketGateway],
    exports: [GroupService, ModeratorService],
})
export class GroupModule {
}
