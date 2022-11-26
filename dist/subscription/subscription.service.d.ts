import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionService {
    create(createSubscriptionDto: CreateSubscriptionDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateSubscriptionDto: UpdateSubscriptionDto): string;
    remove(id: number): string;
}
