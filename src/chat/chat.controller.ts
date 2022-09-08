import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LeanDocument } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { UserDocument } from 'src/users/users.schema';
import { ChatDocument } from './chat.schema';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageService } from './message.service';
import { MessageDocument } from './messages.schema';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private socketService: SocketGateway
  ) {}

  @Post('/create')
  async createChat(
    @Body('receiverId') receiverId: string,
    @GetUser() user: UserDocument
  ): Promise<ChatDocument> {
    return (await this.chatService.create({ members: [user._id, receiverId] })).populate({
      path: 'members',
      match: { _id: { $ne: user._id } },
      select: 'avatar firstName lastName',
    });
  }

  @Get('/recent-chat')
  async recentChat(@GetUser() user: UserDocument): Promise<LeanDocument<UserDocument>[]> {
    return await this.chatService.findAll({ members: { $in: [user._id] } }).populate({
      path: 'members',
      match: { _id: { $ne: user._id } },
      select: 'avatar firstName lastName',
    });
  }

  @Get('/find-one/:receiverId')
  async findOne(
    @Param('receiverId') receiverId: string,
    @GetUser() user: UserDocument
  ): Promise<LeanDocument<UserDocument>[]> {
    return await this.chatService
      .findOneRecord({ members: { $all: [receiverId, user._id] } })
      .populate({
        path: 'members',
        match: { _id: { $ne: user._id } },
        select: 'avatar firstName lastName',
      });
  }

  @Post('/message/create')
  async createMessage(
    @Body() body: CreateMessageDto,
    @GetUser() user: UserDocument
  ): Promise<string> {
    const message = await this.messageService.create({ ...body, sender: user._id });
    this.socketService.triggerMessage(body.chat, message);
    return 'message sent successfully.';
  }

  @Get('/message/find-all/:chatId')
  async findAllMessage(@Param('chatId') chatId: string): Promise<LeanDocument<MessageDocument>[]> {
    return await this.messageService.findAll({ chat: chatId }).sort({ createdAt: -1 });
  }

  // // create a new chat or get chat details
  // @Get('/user/:receiverId')
  // async create(
  //   @Param('receiverId') receiverId: string,
  //   @GetUser() user: UserDocument
  // ): Promise<ChatDocument> {
  //   const chatExists = await this.chatService.findOne({
  //     $or: [{ sender: user._id }, { receiver: receiverId }],
  //   });

  //   if (!chatExists) {
  //     return await this.chatService.save(user._id, receiverId);
  //   }
  //   return chatExists;
  // }

  // send message in a chat
  // @Post('/:chatId/sendMessage')
  // async sendMessage(
  //   @Param('chatId') chatId: string,
  //   @Body('message') message: string,
  //   @GetUser() user: UserDocument
  // ) {
  //   const messageCreated = await this.messageService.create({
  //     message,
  //     sender: user._id,
  //     chat: chatId,
  //   });
  //   await this.chatService.findAndUpdate({ _id: chatId }, { $push: { messages: messageCreated } });
  //   this.socketService.triggerMessage(chatId, messageCreated);
  // }

  // @Get('find-all')
  // async findAll(@GetUser() user: UserDocument) {
  //   await this.chatService.findAllChat({ $or: [{ sender: user._id }, { receiver: user._id }] });
  // }
}
