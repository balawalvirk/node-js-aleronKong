import { Module } from '@nestjs/common';
import admin from 'firebase-admin';
import { firebaseCredientals } from 'firebase';
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {
  serviceAccout = firebaseCredientals as admin.ServiceAccount;

  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(this.serviceAccout),
    });
  }
}
