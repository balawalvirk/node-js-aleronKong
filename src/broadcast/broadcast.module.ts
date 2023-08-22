import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Broadcast, BroadcastSchema } from './broadcast.schema';
import { SocketGateway } from 'src/helpers';
import { HttpModule } from '@nestjs/axios';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]), HttpModule, PostsModule],
  controllers: [BroadcastController],
  providers: [BroadcastService, SocketGateway],
})
export class BroadcastModule {}
