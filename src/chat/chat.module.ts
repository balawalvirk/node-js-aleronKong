import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { ChatController } from './chat.controller';
import { Message, MessageSchema } from './messages.schema';
import { MessageService } from './message.service';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { MuteModule } from 'src/mute/mute.module';
import {SocketGateway} from "src/helpers";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    NotificationModule,
    FirebaseModule,
    MuteModule,
  ],
  providers: [ChatService, MessageService,SocketGateway],
  controllers: [ChatController],
  exports: [MessageService, ChatService],
})
export class ChatModule {}
