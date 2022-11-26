import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
export declare class PurchasesService {
    create(createPurchaseDto: CreatePurchaseDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updatePurchaseDto: UpdatePurchaseDto): string;
    remove(id: number): string;
}
