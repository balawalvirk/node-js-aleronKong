import {Injectable} from '@nestjs/common';
import admin from 'firebase-admin';
import {Message} from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {

    async getNotificationTitle(title) {
        const notification_titles = {
            postLiked: 'Liked Your Post',
            postCommented: 'New Comment',
            userFollowing: 'Following You',
            userSupporting: 'Supporting You',
            newMessage: 'New Message',
            orderPlaced: 'Order Placed',
            productBought: 'Product Bought',
            fundraisingProjectApproved: 'Fundraising Project Approved',
            fundraisingProjectFunded: 'Fundraising Project Funded',
            groupJoinRequest: 'New Group Join Request',
            groupJoined: 'Joined Your Group',
            newGroupPost: 'New Group Post',
            userTagged: 'Tagged You',
            sellerRequest: 'Seller Request',
            sellerRequestApproveRejected: 'Seller Request Approved/Rejected',
            postReacted: 'Reacted on Post',
            friendRequest: 'New Friend Request',
            groupInvitation: 'New Group Invitation',
            commentReacted: 'Reacted on Comment',
            commentReplied: 'Repled on Comment',
            pageInvitation: 'New Page Invitation',
            pageModerator: 'Added You as Page Moderator',
            pageFollows: 'Following Your Page'
        };
        return notification_titles[title] || "New Message"
    }


    async sendNotification(message: Message) {
        try {


            if (!message.notification.title) {
                if(message.data.type){

                    message.notification.title = `${await this.getNotificationTitle(message.data.type)}`

                }else{
                    message.notification.title = "New Message"
                }
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
