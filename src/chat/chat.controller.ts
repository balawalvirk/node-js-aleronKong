import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ParseObjectId } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { SocketGateway } from 'src/helpers/gateway/socket.gateway';
import { UserDocument } from 'src/users/users.schema';
import { ChatDocument } from './chat.schema';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MuteChatDto } from './dto/mute-chat.dto';
import { MessageService } from './message.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    private socketService: SocketGateway
  ) {}

  @Post('/create')
  async createChat(@Body('receiverId') receiverId: string, @GetUser() user: UserDocument) {
    const chat = await this.chatService.findAllRecords({ members: { $in: [receiverId] } });
    if (chat)
      throw new HttpException('You already have chat with this member.', HttpStatus.BAD_REQUEST);
    return (await this.chatService.createRecord({ members: [user._id, receiverId] })).populate({
      path: 'members',
      match: { _id: { $ne: user._id } },
      select: 'avatar firstName lastName',
    });
  }

  @Get('/recent-chat')
  async recentChat(@GetUser() user: UserDocument) {
    return await this.chatService.findAllRecords({ members: { $in: [user._id] } }).populate({
      path: 'members',
      match: { _id: { $ne: user._id } },
      select: 'avatar firstName lastName',
    });
  }

  @Get('/find-one/:receiverId')
  async findOne(@Param('receiverId') receiverId: string, @GetUser() user: UserDocument) {
    return await this.chatService
      .findOneRecord({ members: { $all: [receiverId, user._id] } })
      .populate({
        path: 'members',
        match: { _id: { $ne: user._id } },
        select: 'avatar firstName lastName',
      });
  }

  @Post('/message/create')
  async createMessage(@Body() createMessageDto: CreateMessageDto, @GetUser() user: UserDocument) {
    const message = await this.messageService.createRecord({
      ...createMessageDto,
      sender: user._id,
    });
    this.socketService.triggerMessage(createMessageDto.chat, message);
    return { message: 'message sent successfully.' };
  }

  @Get('/message/find-all/:chatId')
  async findAllMessage(@Param('chatId') chatId: string) {
    return await this.messageService.findAllRecords({ chat: chatId }).sort({ createdAt: -1 });
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseObjectId) id: string) {
    const chat: ChatDocument = await this.chatService.deleteSingleRecord({ _id: id });
    await this.messageService.deleteManyRecord({ chat: chat._id });
    return { message: 'Conversation deleted successfully.' };
  }

  @Put('mute')
  async muteChat(muteChatDto: MuteChatDto) {
    const { chat, ...rest } = muteChatDto;
    return await this.chatService.findOneRecordAndUpdate({ _id: chat }, { ...rest });
  }
}
