import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { ChatController } from './chat.controller';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { Message, MessageSchema } from './messages.schema';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [ChatService, SocketGateway, MessageService],
  controllers: [ChatController],
})
export class ChatModule {}
