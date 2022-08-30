import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { UserDocument } from 'src/users/users.schema';
import { ChatDocument } from './chat.schema';
import { ChatService } from './chat.service';
import { MessageService } from './message.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private socketService: SocketGateway
  ) {}

  // create a new chat or get chat details
  @Get('/user/:receiverId')
  async create(
    @Param('receiverId') receiverId: string,
    @GetUser() user: UserDocument
  ): Promise<ChatDocument> {
    const chatExists = await this.chatService.findOne({
      $or: [{ sender: user._id }, { receiver: receiverId }],
    });

    if (!chatExists) {
      return await this.chatService.save(user._id, receiverId);
    }
    return chatExists;
  }

  // send message in a chat
  @Post('/:chatId/sendMessage')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body('message') message: string,
    @GetUser() user: UserDocument
  ) {
    const messageCreated = await this.messageService.create({
      message,
      sender: user._id,
      chat: chatId,
    });
    await this.chatService.findAndUpdate({ _id: chatId }, { $push: { messages: messageCreated } });
    this.socketService.triggerMessage(chatId, messageCreated);
  }

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument) {
    await this.chatService.findAllChat({ $or: [{ sender: user._id }, { receiver: user._id }] });
  }
}
