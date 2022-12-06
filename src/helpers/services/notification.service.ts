import { Injectable } from '@nestjs/common';
import { initializeApp, credential, messaging } from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor() {
    initializeApp({
      credential: credential.cert({}),
    });
  }

  async sendNotification(data: any, token: string) {
    await messaging().send({ data, token });
  }
}
