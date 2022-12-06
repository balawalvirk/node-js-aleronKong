import { Injectable } from '@nestjs/common';
import { firebaseCredientals } from 'firebase';
import { initializeApp, credential, messaging, ServiceAccount } from 'firebase-admin';

@Injectable()
export class FirebaseService {
  serviceAccout = firebaseCredientals as ServiceAccount;
  constructor() {
    initializeApp({
      credential: credential.cert(this.serviceAccout),
    });
  }

  async sendNotification(data: any, token: string) {
    await messaging().send({ data, token });
  }
}
