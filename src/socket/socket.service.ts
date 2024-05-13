import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Server} from 'socket.io';
import Cache from 'cache-manager';
import {v4 as uuid} from 'uuid';
import {WebSocketServer} from "@nestjs/websockets";

const moment = require('moment')

@Injectable()
export class SocketService {
    public socketServer: Server = null;
    @WebSocketServer() wss: Server;

    constructor(
    ) {
    }


    initSocket = (socketServer: Server) => {
        console.log("initsocket = ");
        this.socketServer = socketServer;
    }

    triggerMessage(event: string, payload: any, creator?: string) {

        this.socketServer.emit(event, payload);

    }




}
