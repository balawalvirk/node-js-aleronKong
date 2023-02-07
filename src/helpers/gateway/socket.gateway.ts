import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private onlineUsers: { userId: string; socketId: string }[] = [];

  @WebSocketServer() wss: Server;

  private readonly logger = new Logger(SocketGateway.name);

  // life cycle event called when client connection disconnected
  handleDisconnect(client: Socket) {
    this.logger.log(`client disconnected ${client.id}`);
    this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== client.id);
  }

  // life cycle event called when web socket is initialized
  afterInit(wss: Server) {
    this.logger.log('Websocket connection started.');
  }

  // life cycle event called when client connected
  handleConnection(client: Socket) {
    this.logger.log(`client connected: ${client.id}`);
  }

  @SubscribeMessage('login')
  loginUser(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    if (!this.onlineUsers.some((user) => user.userId === userId)) {
      this.onlineUsers.push({ userId, socketId: client.id });
    }
  }

  @SubscribeMessage('check-status')
  checkStatus(@MessageBody() userId: string) {
    if (!this.onlineUsers.some((user) => user.userId === userId)) this.wss.emit('check-status', { online: true });
    else this.wss.emit('check-status', { online: false });
  }

  triggerMessage(event: string, payload: any) {
    this.wss.emit(event, payload);
  }
}
