import mongoose from 'mongoose';
import { AddressService } from 'src/address/address.service';
import { CartService } from 'src/product/cart.service';
import { StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { ProductCategoryService } from './category.service';
import { CreateProductCategoryDto } from './dtos/create-category.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductService } from './product.service';
import { OrderService } from 'src/order/order.service';
import { BuyProductDto } from './dtos/buy-product.dto';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { SaleService } from './sale.service';
import { UsersService } from 'src/users/users.service';
import { FindStoreProductsQueryDto } from './dtos/find-store-products-query.dto';
import { ReviewService } from '../review/review.service';
import { CreateReviewDto } from './dtos/create-review.dto';
import { FindAllProductsQuery } from './dtos/find-all-products.query';
import { NotificationService } from 'src/notification/notification.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FindAllCategoriesQueryDto } from './dtos/find-all-categories.query.dto';
import { UpdateProductCategoryDto } from './dtos/update.category.dto';
import { BuySeriesDto } from './dtos/buy-series.dto';
import * as Shopify from 'shopify-api-node';
import { CreateShowCaseProductDto } from './dtos/create-showcase-product.dto';
import { TrackDto } from './dtos/track.dto';
import { TrackService } from './track.service';
import { FindBoughtProductsQueryDto } from './dtos/find-bought.query.dto';
export declare class ProductController {
    private readonly productService;
    private readonly stripeService;
    private readonly addressService;
    private readonly categoryService;
    private readonly cartService;
    private readonly orderService;
    private readonly saleService;
    private readonly userService;
    private readonly reviewService;
    private readonly notificationService;
    private readonly firebaseService;
    private readonly trackService;
    constructor(productService: ProductService, stripeService: StripeService, addressService: AddressService, categoryService: ProductCategoryService, cartService: CartService, orderService: OrderService, saleService: SaleService, userService: UsersService, reviewService: ReviewService, notificationService: NotificationService, firebaseService: FirebaseService, trackService: TrackService);
    create(createProductDto: CreateProductDto, user: UserDocument): Promise<Omit<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>>;
    remove(id: string, user: UserDocument): Promise<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, user: UserDocument): Promise<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    findAllProducts({ page, limit, ...rest }: FindAllProductsQuery): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: Omit<import("./product.schema").Product & mongoose.Document<any, any, any> & {
            _id: mongoose.Types.ObjectId;
        }, never>[];
    }>;
    findOne(id: string, user: UserDocument): Promise<(import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }) | {
        boughtSeries: string[];
    }>;
    findStoreProducts({ showBoughtProducts, ...rest }: FindStoreProductsQueryDto, user: UserDocument): Promise<any[]>;
    findBoughtProducts({ sort }: FindBoughtProductsQueryDto, user: UserDocument): Promise<any[]>;
    checkout(user: UserDocument): Promise<{
        message: string;
    }>;
    buyProduct(user: UserDocument, buyProductDto: BuyProductDto): Promise<{
        message: string;
    }>;
    buySeries(user: UserDocument, buySeriesDto: BuySeriesDto): Promise<{
        message: string;
    }>;
    findAllTrendingProducts(category: string): Promise<Omit<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>[]>;
    createCategory(createProductCategoryDto: CreateProductCategoryDto): Promise<import("./category.schema").ProductCategory & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    findAllCategories({ query, limit, page, ...rest }: FindAllCategoriesQueryDto): Promise<{
        total: number;
        pages: number;
        page: number;
        limit: number;
        data: (import("./category.schema").ProductCategory & mongoose.Document<any, any, any> & {
            _id: mongoose.Types.ObjectId;
        })[];
    }>;
    deleteCategory(id: string): Promise<{
        message: string;
    }>;
    updateCategory(id: string, { title, type }: UpdateProductCategoryDto): Promise<{
        message: string;
    }>;
    findCart(user: UserDocument): Promise<{
        message: string;
    } | {
        subTotal: number;
        total: number;
        tax: number;
        _id: any;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        items: mongoose.LeanDocument<import("./cart.schema").Item>[];
        message?: undefined;
    }>;
    addItem(user: UserDocument, id: string, addToCartDto: AddToCartDto): Promise<{
        subTotal: number;
        total: number;
        tax: number;
    } | {
        total: number;
        subTotal: number;
        tax: number;
        _id: any;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        items: mongoose.LeanDocument<import("./cart.schema").Item>[];
    }>;
    removeProduct(id: string, user: UserDocument): Promise<{
        total: number;
        subTotal: number;
        tax: number;
        _id: any;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        items: mongoose.LeanDocument<import("./cart.schema").Item>[];
    }>;
    increaseDecreaseItem(id: string, user: UserDocument, inc: string, dec: string): Promise<{
        total: number;
        tax: number;
        subTotal: number;
        _id: any;
        __v?: any;
        id?: any;
        creator: import("src/users/users.schema").User;
        items: mongoose.LeanDocument<import("./cart.schema").Item>[];
    }>;
    createShowcaseProduct({ product }: CreateShowCaseProductDto, user: UserDocument): Promise<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    deleteShowcaseProduct(id: string): Promise<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    updateShowcaseProduct(id: string, updateProductDto: UpdateProductDto): Promise<import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
    findAllShowcaseProducts(): Promise<(import("./product.schema").Product & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    })[]>;
    createReview(user: UserDocument, createReviewDto: CreateReviewDto): Promise<{
        message: string;
    }>;
    findAllReviews(id: string): Promise<Omit<import("../review/review.schema").Review & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }, never>[]>;
    findAllShopifyProducts(user: UserDocument): Promise<Shopify.IPaginatedResult<Shopify.IProduct>>;
    track(trackDto: TrackDto, user: UserDocument): Promise<import("./tracking.schema").Track & mongoose.Document<any, any, any> & {
        _id: mongoose.Types.ObjectId;
    }>;
}
