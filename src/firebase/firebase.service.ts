import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  async sendNotification(message: Message) {
    try {
      await admin.messaging().send(message);
    } catch (err) {
      console.log(err);
    }
  }
}
