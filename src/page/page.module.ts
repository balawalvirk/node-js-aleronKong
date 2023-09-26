import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageController } from './page.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Page, PageSchema } from './page.schema';
import { PostsModule } from 'src/posts/posts.module';
import {PageInvitation, PageInvitationSchema} from "src/page/invitation.schema";
import {PageInvitationService} from "src/page/invitation.service";
import {NotificationModule} from "src/notification/notification.module";
import {FirebaseModule} from "src/firebase/firebase.module";
import {PageModerator, PageModeratorSchema} from "src/page/moderator.schema";
import {PageModeratorService} from "src/page/moderator.service";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
      MongooseModule.forFeature([{ name: PageInvitation.name, schema: PageInvitationSchema }]),
      MongooseModule.forFeature([{ name: PageModerator.name, schema: PageModeratorSchema }]),
      PostsModule,
      NotificationModule,
      FirebaseModule,
  ],
  controllers: [PageController],
  providers: [PageService,PageInvitationService,PageModeratorService],
  exports: [PageService],
})
export class PageModule {}
