import {Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {ParseObjectId} from 'src/helpers';
import {GetUser} from 'src/helpers/decorators/user.decorator';
import {SocketGateway} from 'src/helpers/gateway/socket.gateway';
import {FirebaseService} from 'src/firebase/firebase.service';
import {NotificationService} from 'src/notification/notification.service';
import {MuteInterval, NotificationType} from 'src/types';
import {UserDocument} from 'src/users/users.schema';
import {ChatDocument} from './chat.schema';
import {ChatService} from './chat.service';
import {CreateMessageDto} from './dto/create-message.dto';
import {MuteChatDto} from './dto/mute-chat.dto';
import {MessageService} from './message.service';
import {MuteService} from 'src/mute/mute.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly messageService: MessageService,
        private readonly socketService: SocketGateway,
        private readonly notificationService: NotificationService,
        private readonly firebaseService: FirebaseService,
        private readonly muteService: MuteService
    ) {
    }

    @Post('/create')
    async createChat(@Body('receiverId') receiverId: string, @GetUser() user: UserDocument) {
        const chat = await this.chatService.findOneRecord({members: {$all: [receiverId, user._id]}});
        if (chat) throw new HttpException('You already have chat with this member.', HttpStatus.BAD_REQUEST);
        return await this.chatService.create([user._id, receiverId], user._id);
    }

    @Get('/recent-chat')
    async recentChat(@GetUser() user: UserDocument) {
        return await this.chatService.findAll({members: {$in: [user._id]}}, user._id, {sort: {updatedAt: -1}});
    }

    @Get('/find-one/:receiverId')
    async findOne(@Param('receiverId') receiverId: string, @GetUser() user: UserDocument) {
        return await this.chatService.findOne({members: {$all: [receiverId, user._id]}}, user._id);
    }

    @Post('/message/create')
    async createMessage(@Body() createMessageDto: CreateMessageDto, @GetUser() user: UserDocument) {
        const chatFound = await this.chatService.findOneRecord({_id: createMessageDto.chat}).populate('members');
        //find receiver from chat object

        //@ts-ignore
        const receiver:any = chatFound.members.find((member) => !member._id.equals(user._id));

        //@ts-ignore
        const message = await this.messageService.createRecord({
            ...createMessageDto,
            sender: user._id,
            receiver: receiver._id
        });
        const chat = await this.chatService.findOneRecordAndUpdate(
            {_id: createMessageDto.chat},
            {lastMessage: message._id, $push: {messages: message._id}}
        );
        //send socket message to members of chat
        this.socketService.triggerMessage(createMessageDto.chat, message);
        this.socketService.triggerMessage('new-message', {chat: createMessageDto.chat, lastMessage: message});

        //create notification obj in database


        // check if chat has muted object or not
        if (chat.mutes.length > 0) {
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
                        await this.firebaseService.sendNotification({
                            token: receiver.fcmToken,
                            notification: {title: `${user.firstName} ${user.lastName} has send you message.`},
                            data: {user: user._id.toString(), type: NotificationType.NEW_MESSAGE},
                        });


                        await this.notificationService.createRecord({
                            message: 'has sent you a message.',
                            sender: user._id,
                            //@ts-ignore
                            receiver: receiver._id,
                            type: NotificationType.NEW_MESSAGE,
                            user: user._id,
                        });
                    }
                }
                // check if date is custom date
                else {
                    //check if date is within duration
                    if (today.getTime() <= mute.startTime.getTime() && today.getTime() >= mute.endTime.getTime()) {
                        return;
                    } else {
                        await this.firebaseService.sendNotification({
                            token: receiver.fcmToken,
                            notification: {title: `${user.firstName} ${user.lastName} has send you message.`},
                            data: {user: user._id.toString(), type: NotificationType.NEW_MESSAGE},
                        });
                    }
                }
            }
        } else {
            await this.firebaseService.sendNotification({
                token: receiver.fcmToken,
                notification: {title: `${user.firstName} ${user.lastName} has send you message.`},
                data: {user: user._id.toString(), type: NotificationType.NEW_MESSAGE},
            });
        }
        return {message: 'message sent successfully.'};
    }

    @Get('/message/find-all/:chatId')
    async findAllMessage(@Param('chatId') chatId: string, @GetUser() user: UserDocument) {
        const messages = await this.messageService.findAllRecords({chat: chatId}).sort({createdAt: 1})
            .populate('post','-likes -comments -reactions -tagged');
        await this.messageService.updateManyRecords({chat: chatId, isRead: false, receiver: user._id}, {isRead: true});
        return messages;
    }

    @Delete('/delete/:id')
    async delete(@Param('id', ParseObjectId) id: string) {
        const chat: ChatDocument = await this.chatService.deleteSingleRecord({_id: id});
        await this.messageService.deleteManyRecord({chat: chat._id});
        return {message: 'Conversation deleted successfully.'};
    }

    @Put('mute')
    async mute(@Body() muteChatDto: MuteChatDto, @GetUser() user: UserDocument) {
        const now = new Date();
        let date = new Date(now);
        let updatedObj: any = {user: user._id, interval: muteChatDto.interval, chat: muteChatDto.chat};
        if (muteChatDto.interval === MuteInterval.DAY) {
            //check if mute interval is one day then add 1 day in date
            date.setDate(now.getDate() + 1);
        } else if (muteChatDto.interval === MuteInterval.WEEK) {
            //check if mute interval is one day then add 7 day in date
            date.setDate(now.getDate() + 7);
        }
        date.toLocaleDateString();

        if (muteChatDto.interval === MuteInterval.DAY || MuteInterval.WEEK) {
            updatedObj = {...updatedObj, date};
        } else {
            updatedObj = {...updatedObj, startTime: muteChatDto.startTime, endTime: muteChatDto.endTime};
        }

        const muteFound = await this.muteService.findOneRecord({user: user._id, chat: muteChatDto.chat});

        //check if mute object already exists then update its interval only
        if (muteFound) {
            const {user, chat, ...rest} = updatedObj;
            return await this.muteService.findOneRecordAndUpdate({_id: muteFound._id}, rest);
        } else {
            const mute = await this.muteService.createRecord(updatedObj);
            await this.chatService.findOneRecordAndUpdate({_id: muteChatDto.chat}, {$push: {mutes: mute._id}});
            return mute;
        }
    }

    @Put(':id/un-mute')
    async unMute(@Param('id', ParseObjectId) id: string) {
        const mute = await this.muteService.deleteSingleRecord({_id: id});
        if (!mute) throw new HttpException('Mute does not exists.', HttpStatus.BAD_REQUEST);
        await this.chatService.findOneRecordAndUpdate({_id: mute.chat}, {$pull: {mutes: mute._id}});
        return mute;
    }

    @Put(':id/read-messages')
    async readMessages(@Param('id', ParseObjectId) id: string) {
        await this.messageService.updateManyRecords({chat: id, isRead: false}, {isRead: true});
        return {message: 'Message read successfully.'};
    }
}
