import { Injectable } from '@nestjs/common';
import { firebaseCredientals } from 'firebase';
import admin from 'firebase-admin';
import { Notification } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  serviceAccout = firebaseCredientals as admin.ServiceAccount;
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccout),
    });
  }

  async sendNotification(notification: Notification, token: string) {
    await admin.messaging().send({ notification, token });
  }
}
