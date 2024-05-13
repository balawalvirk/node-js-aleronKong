import {Logger} from '@nestjs/common';
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
import {Server, Socket} from 'socket.io';
import {BroadcastService} from "src/broadcast/broadcast.service";

@WebSocketGateway({
    cors: {origin: '*'},
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private onlineUsers: { userId: string; socketId: string }[] = [];
    private joinedChats: { userId: string; chatId: string }[] = [];
    //private readonly broadcastService: BroadcastService;


    constructor(private readonly broadcastService: BroadcastService) {
    }

    @WebSocketServer() wss: Server;
    private readonly logger = new Logger(SocketGateway.name);




    async handleDisconnect(socket: Socket) {
        this.logger.log(`client disconnected: ${socket.id}`);
        const user = this.onlineUsers.filter((user) => user.socketId === socket.id);
        if (user && user.length > 0) {
            await this.broadcastService.deleteUserLiveBroadcast(user[0].userId);
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
            this.onlineUsers.push({userId, socketId: socket.id});
            this.wss.emit('check-status', this.onlineUsers);
        }
    }

    @SubscribeMessage('logout')
    logout(@ConnectedSocket() socket: Socket) {
        this.logger.log(`client disconnected: ${socket.id}`);
        this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
        this.wss.emit('check-status', this.onlineUsers);
    }


    @SubscribeMessage('join-chat')
    joinChat(client, payload: any) {
        const index = this.joinedChats.findIndex((user) => user?.userId === payload.userId);
        if (index === -1) {
            this.joinedChats.push({...payload});
        } else {
            this.joinedChats[index] = payload;
        }

        console.log(this.joinedChats);
    }

    @SubscribeMessage('leave-chat')
    leaveChat(@MessageBody('userId') userId: string, @ConnectedSocket() socket: Socket) {
        const index = this.joinedChats.findIndex((user) => user?.userId === userId);
        if (index !== -1) {
            delete this.joinedChats[index]
        }
    }

    triggerMessage(event: string, payload: any, creator?: string) {

        this.wss.emit(event, payload);

    }


    getJoinedChatByUserId(userId: string, chatId: string) {
        return (this.joinedChats.filter((user) => user.userId === userId && user.chatId === chatId)).length > 0;

    }
}
