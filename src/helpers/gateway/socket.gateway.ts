import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;

  private readonly logger = new Logger(SocketGateway.name);

  // life cycle event called when client connection disconnected
  handleDisconnect(client: Socket) {
    this.logger.log(`Websocket disconnected ${client.id}`);
  }

  // life cycle event called when web socket is initialized
  afterInit(wss: Server) {
    this.logger.log('Websocket connection started.');
  }

  // life cycle event called when client connected
  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async triggerMessage(event: string, payload: any) {
    this.wss.emit(event, payload);
  }
}
