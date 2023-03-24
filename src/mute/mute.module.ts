import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mute, MuteSchema } from './mute.schema';
import { MuteService } from './mute.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Mute.name, schema: MuteSchema }])],
  providers: [MuteService],
  exports: [MuteService],
})
export class MuteModule {}
