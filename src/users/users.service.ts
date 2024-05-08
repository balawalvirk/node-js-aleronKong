import {Injectable, Query} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import mongoose, {FilterQuery, Model} from 'mongoose';
import {GetUser, StripeService} from 'src/helpers';
import {BaseService} from 'src/helpers/services/base.service';
import {User, UserDocument} from 'src/users/users.schema';
import {NotificationService} from "src/notification/notification.service";
import {MessageService} from "src/chat/message.service";
import {CartService} from "src/product/cart.service";
import {UserHomeQueryDto} from "src/users/dtos/find-transections.query.dto";

@Injectable()
export class UsersService extends BaseService<UserDocument> {
    constructor(
        @InjectModel(User.name) private userModal: Model<UserDocument>,
        private readonly stripeService: StripeService,
        private readonly notificationService: NotificationService,
        private readonly messageService: MessageService,
        private readonly cartService: CartService,
    ) {
        super(userModal);
    }

    async findOne(query: FilterQuery<UserDocument>) {
        return await this.userModal
            .findOne(query)
            .populate([{path: 'defaultAddress'}, {path: 'supportingPackages'}])
            .lean();
    }


    async findOneWithoutLean(query: FilterQuery<UserDocument>) {
        return await this.userModal
            .findOne(query)
            .populate([{path: 'defaultAddress'}, {path: 'supportingPackages'}])
    }


    async createCustomerAccount(email: string, name: string) {
        return await this.stripeService.createCustomer({email, name});
    }

    async searchQuery() {
        return await this.userModal.find({
            $expr: {
                $regexMatch: {
                    input: {
                        $concat: ['$firstName', ' ', '$lastName'],
                    },
                    regex: 'awais',
                    options: 'i',
                },
            },
        });
    }

    getMutalFriends(users: UserDocument[], currentUser: UserDocument) {
        const currentUserFriends = currentUser.friends.map((id) => id.toString());
        return users.map((user) => {
            let mutalFriends = 0;
            const stringifyArray = user.friends.map((id) => id.toString());
            //@ts-ignore
            stringifyArray.forEach((id) => {
                if (currentUserFriends.includes(id)) {
                    mutalFriends += 1;
                }
            });
            return {...user.toJSON(), mutalFriends};
        });
    }

    async getNotificationData(@GetUser() user: UserDocument, @Query() {pageId}: UserHomeQueryDto) {

        const messages = await this.messageService.countRecords({receiver: user._id, isRead: false});
        const notifications = await this.notificationService.countRecords({receiver: user._id, isRead: false});

        let pageMessageCount = 0;
        let notificationMessageCount = 0;

        if (pageId) {
            notificationMessageCount = await this.notificationService.countRecords({
                page: new mongoose.Types.ObjectId(pageId),
                isRead: false
            });

        }


        const cart = await this.cartService.findOneRecord({creator: user._id});
        return {
            messages,
            notifications,
            notificationMessageCount,
            pageMessageCount,
            cartItems: cart?.items?.length || 0
        };

    }


    async findRandomResult(allUsers,limit) {



            const count=await this.countRecords({_id: {$nin: allUsers}});


            const random = Math.floor(Math.random() * count)

            let users=[];

            for(let i=0;i<limit;i++){
                const user=await this.userModal.findOne({_id: {$nin: allUsers}}).skip(random);
                users.push(user);
            }
            return users;

    }


}
