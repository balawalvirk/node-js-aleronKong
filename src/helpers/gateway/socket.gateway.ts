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

  handleDisconnect(socket: Socket) {
    this.logger.log(`client disconnected ${socket.id}`);
    this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
  }

  afterInit(wss: Server) {
    this.logger.log('Websocket connection started.');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`client connected: ${socket.id}`);
  }

  @SubscribeMessage('login')
  loginUser(@MessageBody() userId: string, @ConnectedSocket() socket: Socket) {
    if (!this.onlineUsers.some((user) => user.userId === userId)) this.onlineUsers.push({ userId, socketId: socket.id });
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
