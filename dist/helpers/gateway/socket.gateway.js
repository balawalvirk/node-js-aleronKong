"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SocketGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let SocketGateway = SocketGateway_1 = class SocketGateway {
    constructor() {
        this.onlineUsers = [];
        this.logger = new common_1.Logger(SocketGateway_1.name);
    }
    handleDisconnect(socket) {
        this.logger.log(`client disconnected: ${socket.id}`);
        const user = this.onlineUsers.filter((user) => user.socketId === socket.id);
        if (user) {
        }
        this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
        this.wss.emit('check-status', this.onlineUsers);
    }
    afterInit(wss) {
        this.logger.log('Websocket connection started.');
    }
    handleConnection(socket) {
        this.logger.log(`client connected: ${socket.id}`);
    }
    checkStatus() {
        this.wss.emit('check-status', this.onlineUsers);
    }
    login(userId, socket) {
        const isOnline = this.onlineUsers.some((user) => user.userId === userId);
        if (!isOnline) {
            this.onlineUsers.push({ userId, socketId: socket.id });
            this.wss.emit('check-status', this.onlineUsers);
        }
    }
    logout(socket) {
        this.logger.log(`client disconnected: ${socket.id}`);
        this.onlineUsers = this.onlineUsers.filter((user) => user.socketId !== socket.id);
        this.wss.emit('check-status', this.onlineUsers);
    }
    triggerMessage(event, payload) {
        this.wss.emit(event, payload);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], SocketGateway.prototype, "wss", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('check-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "checkStatus", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('login'),
    __param(0, (0, websockets_1.MessageBody)('userId')),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "login", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('logout'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], SocketGateway.prototype, "logout", null);
SocketGateway = SocketGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
    })
], SocketGateway);
exports.SocketGateway = SocketGateway;
//# sourceMappingURL=socket.gateway.js.map