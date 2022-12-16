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
import { FirebaseService } from 'src/helpers/services/firebase.service';
import { NotificationService } from 'src/notification/notification.service';
import { MuteInterval, NotificationType } from 'src/types';
import { User, UserDocument } from 'src/users/users.schema';
import { ChatDocument } from './chat.schema';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MuteChatDto } from './dto/mute-chat.dto';
import { MessageService } from './message.service';
import { MessageDocument } from './messages.schema';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly socketService: SocketGateway,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post('/create')
  async createChat(@Body('receiverId') receiverId: string, @GetUser() user: UserDocument) {
    const chat = await this.chatService.findAllRecords({ members: { $in: [receiverId] } });
    if (chat.length > 0)
      throw new HttpException('You already have chat with this member.', HttpStatus.BAD_REQUEST);
    return await this.chatService.create([user._id, receiverId], user._id);
  }

  @Get('/recent-chat')
  async recentChat(@GetUser() user: UserDocument) {
    return await this.chatService.findAll({ members: { $in: [user._id] } }, user._id);
  }

  @Get('/find-one/:receiverId')
  async findOne(@Param('receiverId') receiverId: string, @GetUser() user: UserDocument) {
    return await this.chatService.findOne({ members: { $all: [receiverId, user._id] } }, user._id);
  }

  @Post('/message/create')
  async createMessage(@Body() createMessageDto: CreateMessageDto, @GetUser() user: UserDocument) {
    const message: MessageDocument = await this.messageService.createRecord({
      ...createMessageDto,
      sender: user._id,
    });
    const chat = await this.chatService.findOneRecordAndUpdate(
      { _id: createMessageDto.chat },
      { lastMessage: message._id }
    );

    this.socketService.triggerMessage(createMessageDto.chat, message);

    //find receiver from chat object
    const receiver = chat.members.find((member) => member._id !== user._id);

    //create notification obj in database
    await this.notificationService.createRecord({
      content: message.content,
      sender: user._id,
      receiver: receiver._id,
      type: NotificationType.MESSAGE,
    });

    //find mute object from chat object
    const mute = chat.mutes.find((chat) => chat.user === user._id);
    // check if current user muted the message
    if (mute) {
      const today = new Date();
      // check if mute interval is week or day.
      if (mute.interval === MuteInterval.DAY || MuteInterval.WEEK) {
        //check if current date is greater that the interval date i.e date is in past
        if (mute.date.getTime() < today.getTime()) {
          //send notification to user fcm token
          await this.firebaseService.sendNotification(
            {
              title: `${user.firstName} ${user.lastName}`,
              body: message.content,
            },
            receiver.fcmToken
          );
        }
      }
      // check if date is custom date
      else {
        //check if date is within duration
        if (
          today.getTime() <= mute.startTime.getTime() &&
          today.getTime() >= mute.endTime.getTime()
        ) {
          return;
        } else {
          await this.firebaseService.sendNotification(
            {
              title: `${user.firstName} ${user.lastName}`,
              body: message.content,
            },
            receiver.fcmToken
          );
        }
      }
    }

    return { message: 'message sent successfully.' };
  }

  @Get('/message/find-all/:chatId')
  async findAllMessage(@Param('chatId') chatId: string) {
    return await this.messageService.findAllRecords({ chat: chatId }).sort({ createdAt: 1 });
  }

  @Delete('/delete/:id')
  async delete(@Param('id', ParseObjectId) id: string) {
    const chat: ChatDocument = await this.chatService.deleteSingleRecord({ _id: id });
    await this.messageService.deleteManyRecord({ chat: chat._id });
    return { message: 'Conversation deleted successfully.' };
  }

  @Put('mute')
  async muteChat(@Body() muteChatDto: MuteChatDto, @GetUser() user: UserDocument) {
    const now = new Date();
    let date = new Date(now);
    let updatedObj: any = { user: user._id, interval: muteChatDto.interval };
    if (muteChatDto.interval === MuteInterval.DAY) {
      //check if mute interval is one day then add 1 day in date
      date.setDate(now.getDate() + 1);
    } else if (muteChatDto.interval === MuteInterval.WEEK) {
      //check if mute interval is one day then add 7 day in date
      date.setDate(now.getDate() + 7);
    }
    date.toLocaleDateString();

    if (muteChatDto.interval === MuteInterval.DAY || MuteInterval.WEEK) {
      updatedObj = { ...updatedObj, date };
    } else {
      updatedObj = {
        ...updatedObj,
        startTime: muteChatDto.startTime,
        endTime: muteChatDto.endTime,
      };
    }

    await this.chatService.findOneRecordAndUpdate(
      { _id: muteChatDto.chat },
      {
        $push: {
          mutes: { ...updatedObj },
        },
      }
    );
    return { message: 'Chat muted successfully.' };
  }
}
