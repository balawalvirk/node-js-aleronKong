import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    create(createSubscriptionDto: CreateSubscriptionDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): string;
    remove(id: string): string;
}
