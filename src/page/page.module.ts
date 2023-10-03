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
import {UsersService} from "src/users/users.service";
import {User, UserSchema} from "src/users/users.schema";
import {SocketGateway, StripeService} from "src/helpers";
import {PageComment, PageCommentSchema} from "src/page/comment.schema";
import {PageReaction, PageReactionSchema} from "src/page/reaction.schema";
import {PageReactionService} from "src/page/reaction.service";
import {PageCommentService} from "src/page/comment.service";

@Module({
  imports: [
      MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
      MongooseModule.forFeature([{ name: PageInvitation.name, schema: PageInvitationSchema }]),
      MongooseModule.forFeature([{ name: PageModerator.name, schema: PageModeratorSchema }]),
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      MongooseModule.forFeature([{ name: PageComment.name, schema: PageCommentSchema }]),
      MongooseModule.forFeature([{ name: PageReaction.name, schema: PageReactionSchema }]),
      PostsModule,
      NotificationModule,
      FirebaseModule,
  ],
  controllers: [PageController],
  providers: [PageService,PageInvitationService,PageModeratorService,UsersService,StripeService,PageReactionService,PageCommentService,
      SocketGateway],
  exports: [PageService],
})
export class PageModule {}
