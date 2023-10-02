import { SocketGateway } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { IEnvironmentVariables } from 'src/types';
import { ConfigService } from '@nestjs/config';
import { PostsService } from 'src/posts/posts.service';
import Cache from 'cache-manager';
import mongoose from "mongoose";
export declare class BroadcastController {
    private readonly broadcastService;
    private readonly postService;
    private readonly configService;
    private readonly socketService;
    private cacheManager;
    constructor(broadcastService: BroadcastService, postService: PostsService, configService: ConfigService<IEnvironmentVariables>, socketService: SocketGateway, cacheManager: Cache);
    create({ role, page }: CreateBroadcastDto, user: UserDocument): Promise<any>;
    findAll(): Promise<Omit<import("./broadcast.schema").Broadcast & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>[]>;
    findOne(id: string): Promise<import("./broadcast.schema").Broadcast & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    remove(id: string, user: UserDocument): Promise<import("./broadcast.schema").Broadcast & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
}
