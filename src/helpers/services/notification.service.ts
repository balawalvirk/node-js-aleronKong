import { Injectable } from '@nestjs/common';
import { initializeApp, credential, messaging } from 'firebase-admin';

@Injectable()
export class NotificationsService {
  constructor() {
    const firebaseCredentials = JSON.parse(process.env.FIREBASE_CREDENTIAL_JSON);
    initializeApp({
      credential: credential.cert(firebaseCredentials),
    });
  }
}
