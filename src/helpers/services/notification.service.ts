import { Injectable } from '@nestjs/common';
import { initializeApp, credential, messaging } from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class NotificationsService {
  constructor() {
    const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIAL_JSON);
    initializeApp({
      credential: credential.cert(firebaseCredentials),
    });
  }

  async sendNotification(message: Message) {
    await messaging().send(message);
  }
}
