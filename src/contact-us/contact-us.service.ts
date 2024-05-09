import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import {Benefit, BenefitDocument} from "src/benefits/benefit.schema";
import {ContactUs, ContactUsDocument} from "src/contact-us/contact-us.schema";

@Injectable()
export class ContactUsService extends BaseService<ContactUsDocument> {
  constructor(@InjectModel(ContactUs.name) private contactUsModel: Model<ContactUsDocument>) {
    super(contactUsModel);
  }
}
