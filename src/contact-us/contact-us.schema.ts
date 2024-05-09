import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document} from 'mongoose';

export type ContactUsDocument = ContactUs & Document;

@Schema({timestamps: true})
export class ContactUs {
    @Prop({required: true})
    name: string;


    @Prop({required: true})
    email: string;


    @Prop({required: true})
    description: string;





    @Prop({default: Date.now})
    date_created: Date;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
