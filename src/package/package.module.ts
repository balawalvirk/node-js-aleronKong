import {Module} from '@nestjs/common';
import {PackageService} from './package.service';
import {PackageController} from './package.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Package, PackageSchema} from './package.schema';
import {SocketGateway, StripeService} from 'src/helpers';
import {UsersModule} from 'src/users/users.module';
import {FirebaseService} from 'src/firebase/firebase.service';
import {NotificationModule} from 'src/notification/notification.module';
import {UserController} from "src/users/users.controller";
import {FirebaseModule} from "src/firebase/firebase.module";
import {OrderModule} from "src/order/order.module";
import {ChatModule} from "src/chat/chat.module";
import {ProductModule} from "src/product/product.module";
import {GroupModule} from "src/group/group.module";
import {UsersService} from "src/users/users.service";
import {User, UserSchema} from "src/users/users.schema";
import {Guild, GuildSchema} from "src/guild/guild.schema";

@Module({
    imports: [MongooseModule.forFeature(
        [
            {name: Package.name, schema: PackageSchema},
            { name: User.name, schema: UserSchema },
            {name: Guild.name, schema: GuildSchema},

        ]), UsersModule, NotificationModule, NotificationModule,
        FirebaseModule,
        OrderModule,
        ChatModule,
        ProductModule,
        GroupModule,
    ],
    controllers: [PackageController],
    providers: [UsersService, PackageService, StripeService, FirebaseService,SocketGateway],
    exports: [PackageService],
})
export class PackageModule {
}
