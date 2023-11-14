import {
    CACHE_MANAGER,
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Header,
    UseGuards,
    BadRequestException,
    Inject
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {GetUser, ParseObjectId, SocketGateway} from 'src/helpers';
import {UserDocument} from 'src/users/users.schema';
import {BroadcastService} from './broadcast.service';
import {CreateBroadcastDto} from './dto/create-broadcast.dto';
import {RtcRole, RtcTokenBuilder} from 'agora-token';
import {AGORA_RTC_ROLE, IEnvironmentVariables, PostPrivacy} from 'src/types';
import {ConfigService} from '@nestjs/config';
import {randomBytes} from 'crypto';
import {PostsService} from 'src/posts/posts.service';
import Cache from 'cache-manager';
import {v4 as uuid} from 'uuid';
import mongoose from "mongoose";
import {PageService} from "src/page/page.service";

@Controller('broadcast')
@UseGuards(JwtAuthGuard)
export class BroadcastController {
    constructor(
        private readonly broadcastService: BroadcastService,
        private readonly postService: PostsService,
        private readonly configService: ConfigService<IEnvironmentVariables>,
        private readonly socketService: SocketGateway,
        private readonly pageService: PageService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
    }

    @Post('create')
    @Header('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    @Header('Expires', '-1')
    @Header('Pragma', 'no-cache')
    async create(@Body() {role,page}: CreateBroadcastDto, @GetUser() user: UserDocument) {


        const pageData: any = await this.pageService.findRecordById(page)

        if(!pageData)
            throw new BadRequestException('Page does not exists.');


        const channel = randomBytes(20).toString('hex');
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const expirationTime = 3600;
        const privilegeExpiredTs = currentTimestamp + expirationTime;
        const rtcRole = role === AGORA_RTC_ROLE.PUBLISHER ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
        const token = RtcTokenBuilder.buildTokenWithUid(
            this.configService.get('AGORA_APP_ID'),
            this.configService.get('AGORA_APP_CERTIFICATE'),
            channel,
            '',
            rtcRole,
            expirationTime,
            privilegeExpiredTs
        );

        const postId=new mongoose.Types.ObjectId();
        const postData={_id:postId,privacy: PostPrivacy.PUBLIC, creator: user._id,page};
        //const createPost:any = await this.postService.createRecord(postData);

        const broadcast = await this.broadcastService.create({token, channel, user: user._id,post:postId,page});
        const {cname, uid, resourceId} = await this.broadcastService.acquireRecording(broadcast.channel);
        const {sid} = await this.broadcastService.startRecording(resourceId, cname, broadcast.token);
        const updatedBroadcast:any = await this.broadcastService.findOneRecordAndUpdate(
            {_id: broadcast._id},
            {$set: {recording: {uid, resourceId, sid}}}
        );

        await this.cacheManager.set((broadcast._id).toString(),JSON.stringify(postData), {ttl:86400});
        await this.cacheManager.set((postId).toString(),JSON.stringify(postData), {ttl:86400});
        this.socketService.triggerMessage('new-broadcast', {...updatedBroadcast._doc,post:postData,page:pageData});

        return {...updatedBroadcast._doc,post:postData,page};
    }

    @Get('find-all')
    async findAll() {
        return await this.broadcastService.findAllRecords().sort({createdAt: -1})
            .populate('user')
            .populate("page");
    }

    @Get(':id/find-one')
    async findOne(@Param('id', ParseObjectId) id: string) {
        return await this.broadcastService.findOneRecord({_id: id}).populate('user');
    }

    @Delete(':id')
    async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const broadcast = await this.broadcastService.deleteSingleRecord({_id: id});
        if (!broadcast || !broadcast.recording) throw new BadRequestException('Broadcast does not exists.');
        this.socketService.triggerMessage('remove-broadcast', broadcast);
        const stop = await this.broadcastService.stopRecording(broadcast.recording.resourceId, broadcast.channel, broadcast.recording.sid);

        let url=""
        if(stop && stop.serverResponse){
            const prefix = this.configService.get('S3_URL');
            url = `${prefix}${stop.serverResponse.fileList[0].fileName}`;
        }

        const postData=await this.cacheManager.get(id);
        if(postData){

            const createPost:any = await this.postService.createRecord(
                {...JSON.parse(postData),videos:[url],live:true});
            //await this.postService.findOneRecordAndUpdate({_id:new mongoose.Types.ObjectId(postId)},{videos: [url]});
            await this.cacheManager.del(id)
        }

        return broadcast;
    }
}
