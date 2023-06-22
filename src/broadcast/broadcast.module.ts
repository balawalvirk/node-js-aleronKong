import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Broadcast, BroadcastSchema } from './broadcast.schema';
import { SocketGateway } from 'src/helpers';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MongooseModule.forFeature([{ name: Broadcast.name, schema: BroadcastSchema }]), HttpModule],
  controllers: [BroadcastController],
  providers: [BroadcastService, SocketGateway],
})
export class BroadcastModule {}
