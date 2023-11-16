import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import {Benefit, BenefitSchema} from "src/benefits/benefit.schema";
import {BenefitService} from "src/benefits/benefit.service";
import {BenefitController} from "src/benefits/benefit.controller";

@Module({
  imports: [MongooseModule.forFeature([{ name: Benefit.name, schema: BenefitSchema }])],
  controllers: [BenefitController],
  providers: [BenefitService],
  exports: [BenefitService],
})
export class BenefitModule {}
