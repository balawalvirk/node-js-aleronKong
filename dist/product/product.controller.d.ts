import { AddressService } from 'src/address/address.service';
import { StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { CollectionDocument } from './collection.schema';
import { CollectionService } from './collection.service';
import { AddProductDto } from './dtos/add-product.dto';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductDocument } from './product.schema';
import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    private readonly collectionService;
    private readonly stripeService;
    private readonly addressService;
    constructor(productService: ProductService, collectionService: CollectionService, stripeService: StripeService, addressService: AddressService);
    create(body: CreateProductDto, user: UserDocument): Promise<any>;
    remove(id: string): Promise<ProductDocument>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<any>;
    inventory(user: UserDocument): Promise<void>;
    findAll(user: UserDocument, type: string): Promise<any[]>;
    checkout({ paymentMethod, address, products }: CreateCheckoutDto, user: UserDocument): Promise<string>;
    createCollection(createCollectionDto: CreateCollectionDto, user: UserDocument): Promise<any>;
    findAllCollections(type: string, user: UserDocument): Promise<CollectionDocument[]>;
    findOneCollections(user: UserDocument): Promise<any>;
    addProduct({ collection, product }: AddProductDto): Promise<any>;
}
