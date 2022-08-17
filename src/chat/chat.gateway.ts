import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  constructor(private readonly chatService: ChatService) {}

  // life cycle event called when client connection disconnected
  handleDisconnect(client: Socket) {
    console.log(`Websocket disconnected ${client.id}`);
  }

  // life cycle event called when web socket is initialized
  afterInit(wss: Server) {
    console.log('Websocket connection started.');
  }

  // life cycle event called when client connected
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async create(@MessageBody() MessageBody: CreateMessageDto) {
    const message = await this.chatService.create(MessageBody);
    this.wss.emit('receiveMessage', message);
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.chatService.findAll();
  }
}
