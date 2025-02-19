import {Injectable} from '@nestjs/common';
import admin from 'firebase-admin';
import {Message} from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
    async sendNotification(message: Message) {
        try {

            if(!message.notification.title){
                message.notification.title="New Message"
            }

            await admin.messaging().send({
                ...message,
                android: {
                    notification: {
                        sound: "default", // Use "default" or a custom sound file from the app
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "default", // iOS sound
                        },
                    },
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
}
