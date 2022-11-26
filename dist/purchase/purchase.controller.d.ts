import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
export declare class PurchaseController {
    private readonly purchaseService;
    constructor(purchaseService: PurchaseService);
    create(createPurchaseDto: CreatePurchaseDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updatePurchaseDto: UpdatePurchaseDto): string;
    remove(id: string): string;
}
