import { LeanDocument } from 'mongoose';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { UserDocument } from 'src/users/users.schema';
import { ChatDocument } from './chat.schema';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { MessageDocument } from './messages.schema';
export declare class ChatController {
    private chatService;
    private messageService;
    private socketService;
    constructor(chatService: ChatService, messageService: MessageService, socketService: SocketGateway);
    createChat(receiverId: string, user: UserDocument): Promise<ChatDocument>;
    recentChat(user: UserDocument): Promise<LeanDocument<UserDocument>[]>;
    findOne(receiverId: string, user: UserDocument): Promise<LeanDocument<UserDocument>[]>;
    createMessage(body: CreateMessageDto, user: UserDocument): Promise<string>;
    findAllMessage(chatId: string): Promise<LeanDocument<MessageDocument>[]>;
}
