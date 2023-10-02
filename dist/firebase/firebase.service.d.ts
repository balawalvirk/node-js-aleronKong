import { Message } from 'firebase-admin/lib/messaging/messaging-api';
export declare class FirebaseService {
    sendNotification(message: Message): Promise<void>;
}
