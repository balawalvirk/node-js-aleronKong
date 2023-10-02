import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private onlineUsers;
    wss: Server;
    private readonly logger;
    handleDisconnect(socket: Socket): void;
    afterInit(wss: Server): void;
    handleConnection(socket: Socket): void;
    checkStatus(): void;
    login(userId: string, socket: Socket): void;
    logout(socket: Socket): void;
    triggerMessage(event: string, payload: any): void;
}
