import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import {Benefit, BenefitSchema} from "src/benefits/benefit.schema";
import {BenefitService} from "src/benefits/benefit.service";
import {BenefitController} from "src/benefits/benefit.controller";
import {ContactUsController} from "src/contact-us/contact-us.controller";
import {ContactUsService} from "src/contact-us/contact-us.service";
import {ContactUs, ContactUsSchema} from "src/contact-us/contact-us.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }])],
  controllers: [ContactUsController],
  providers: [ContactUsService],
  exports: [ContactUsService],
})
export class ContactUsModule {}
