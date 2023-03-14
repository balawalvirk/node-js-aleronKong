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
import { Reaction, ReactionSchema } from './reaction.schema';
import { ReactionService } from './reaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: Reaction.name, schema: ReactionSchema }]),
    NotificationModule,
    FirebaseModule,
  ],
  providers: [ChatService, SocketGateway, MessageService, ReactionService],
  controllers: [ChatController],
  exports: [MessageService, ChatService],
})
export class ChatModule {}
