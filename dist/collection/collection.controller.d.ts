import { UserDocument } from 'src/users/users.schema';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
export declare class CollectionController {
    private readonly collectionService;
    constructor(collectionService: CollectionService);
    create(createCollectionDto: CreateCollectionDto, user: UserDocument): Promise<any>;
    addProduct(id: string, productId: string): Promise<any>;
}
