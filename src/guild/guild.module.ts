import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {StripeService} from 'src/helpers';
import {UsersModule} from 'src/users/users.module';
import {FirebaseService} from 'src/firebase/firebase.service';
import {NotificationModule} from 'src/notification/notification.module';
import {Guild, GuildSchema} from "./guild.schema";
import {GuildController} from "./guild.controller";
import {GuildService} from "./guild.service";
import {PackageService} from "src/package/package.service";
import {Package, PackageSchema} from "src/package/package.schema";
import {Benefit, BenefitSchema} from "src/benefits/benefit.schema";

@Module({
    imports: [MongooseModule.forFeature([
        {name: Guild.name, schema: GuildSchema},
        {name: Package.name, schema: PackageSchema},
        {name: Benefit.name, schema: BenefitSchema}

    ]),
        UsersModule, NotificationModule],
    controllers: [GuildController],
    providers: [GuildService, StripeService, FirebaseService, PackageService],
    exports: [GuildService],
})
export class GuildModule {
}
