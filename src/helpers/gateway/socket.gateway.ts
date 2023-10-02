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
    this.logger.log(`client disconnected: ${socket.id}`);
    const user=this.onlineUsers.filter((user)=>user.socketId===socket.id);
    if(user){

    }

    this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
    this.wss.emit('check-status', this.onlineUsers);
  }

  afterInit(wss: Server) {
    this.logger.log('Websocket connection started.');
  }

  handleConnection(socket: Socket) {
    this.logger.log(`client connected: ${socket.id}`);
  }

  @SubscribeMessage('check-status')
  checkStatus() {
    this.wss.emit('check-status', this.onlineUsers);
  }

  @SubscribeMessage('login')
  login(@MessageBody('userId') userId: string, @ConnectedSocket() socket: Socket) {
    const isOnline = this.onlineUsers.some((user) => user.userId === userId);
    if (!isOnline) {
      this.onlineUsers.push({ userId, socketId: socket.id });
      this.wss.emit('check-status', this.onlineUsers);
    }
  }

  @SubscribeMessage('logout')
  logout(@ConnectedSocket() socket: Socket) {
    this.logger.log(`client disconnected: ${socket.id}`);
    this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
    this.wss.emit('check-status', this.onlineUsers);
  }




  triggerMessage(event: string, payload: any) {
    this.wss.emit(event, payload);
  }
}
