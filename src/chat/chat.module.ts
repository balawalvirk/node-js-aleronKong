import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { ChatController } from './chat.controller';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { Message, MessageSchema } from './messages.schema';
import { MessageService } from './message.service';
import { NotificationModule } from 'src/notification/notification.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { MuteModule } from 'src/mute/mute.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    NotificationModule,
    FirebaseModule,
    MuteModule,
  ],
  providers: [ChatService, SocketGateway, MessageService],
  controllers: [ChatController],
  exports: [MessageService, ChatService],
})
export class ChatModule {}
