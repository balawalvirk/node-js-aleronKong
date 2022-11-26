import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private onlineUsers;
    wss: Server;
    private readonly logger;
    handleDisconnect(client: Socket): void;
    afterInit(wss: Server): void;
    handleConnection(client: Socket): void;
    loginUser(userId: string, client: Socket): void;
    triggerMessage(event: string, payload: any): void;
}
