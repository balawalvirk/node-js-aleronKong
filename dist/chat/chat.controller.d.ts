/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NotificationService } from 'src/notification/notification.service';
import { UserDocument } from 'src/users/users.schema';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MuteChatDto } from './dto/mute-chat.dto';
import { MessageService } from './message.service';
import { MuteService } from 'src/mute/mute.service';
export declare class ChatController {
    private readonly chatService;
    private readonly messageService;
    private readonly socketService;
    private readonly notificationService;
    private readonly firebaseService;
    private readonly muteService;
    constructor(chatService: ChatService, messageService: MessageService, socketService: SocketGateway, notificationService: NotificationService, firebaseService: FirebaseService, muteService: MuteService);
    createChat(receiverId: string, user: UserDocument): Promise<Omit<import("./chat.schema").Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>>;
    recentChat(user: UserDocument): Promise<Omit<import("./chat.schema").Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    findOne(receiverId: string, user: UserDocument): Promise<import("./chat.schema").Chat & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    createMessage(createMessageDto: CreateMessageDto, user: UserDocument): Promise<{
        message: string;
    }>;
    findAllMessage(chatId: string, user: UserDocument): Promise<(import("./messages.schema").Message & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    delete(id: string): Promise<{
        message: string;
    }>;
    mute(muteChatDto: MuteChatDto, user: UserDocument): Promise<import("../mute/mute.schema").Mute & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    unMute(id: string): Promise<import("../mute/mute.schema").Mute & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    readMessages(id: string): Promise<{
        message: string;
    }>;
}
