import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { ChatController } from './chat.controller';
import { MessageModule } from './messages.module';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]), MessageModule],
  providers: [ChatService, SocketGateway],
  controllers: [ChatController],
})
export class ChatModule {}
