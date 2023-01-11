import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { CartService } from 'src/product/cart.service';
import { ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { CollectionConditions, CollectionTypes, ProductType, UserRoles } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { ProductCategoryService } from './category.service';
import { CollectionDocument } from './collection.schema';
import { CollectionService } from './collection.service';
import { AddProductDto } from './dtos/add-product.dto';
import { CreateProductCategoryDto } from './dtos/create-category.dto';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
import { CreateCollectionDto } from './dtos/create-collection.dto';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductService } from './product.service';
import { OrderService } from 'src/order/order.service';
import { BuyProductDto } from './dtos/buy-product.dto';
import { AddToCartDto } from './dtos/add-to-cart.dto';
import { SaleService } from './sale.service';
import { UsersService } from 'src/users/users.service';
import { FindStoreProductsQueryDto } from './dtos/find-store-products-query.dto';

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly collectionService: CollectionService,
    private readonly stripeService: StripeService,
    private readonly addressService: AddressService,
    private readonly categoryService: ProductCategoryService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly saleService: SaleService,
    private readonly userService: UsersService
  ) {}

  @Post('create')
  async create(@Body() body: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.create({ ...body, creator: user._id });
  }

  @Delete(':id/delete')
  async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const product = await this.productService.deleteSingleRecord({ _id: id });
    await this.collectionService.updateManyRecords(
      { products: { $in: [product._id] } },
      { $pull: { products: product._id } }
    );
    await this.saleService.deleteManyRecord({ product: product._id });
    if (product.type === ProductType.DIGITAL)
      await this.userService.findOneRecordAndUpdate(
        { _id: user._id },
        { $pull: { boughtDigitalProducts: product._id } }
      );
    return product;
  }

  @Put(':id/update')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.update({ _id: id }, updateProductDto);
  }

  @Get('/inventory')
  async inventory(@GetUser() user: UserDocument) {
    await this.productService.findAllRecords({ creator: user._id });
  }

  // find user store products and all store products
  @Get('store')
  async findStoreProducts(
    @Query() { showBoughtProducts, ...rest }: FindStoreProductsQueryDto,
    @GetUser() user: UserDocument
  ) {
    const ObjectId = mongoose.Types.ObjectId;
    if (!showBoughtProducts) {
      //loop through rest object and convert id string to mongo id
      Object.keys(rest).forEach((key) => (rest[key] = new ObjectId(rest[key])));
      return await this.productService.findStoreProducts(rest);
    } else {
      //@ts-ignore
      const products = user.boughtDigitalProducts.map((product) => new ObjectId(product));
      return await this.productService.findStoreProducts({ _id: { $in: products } });
    }
  }

  @Post('checkout')
  async checkout(@Body() { paymentMethod, address }: CreateCheckoutDto, @GetUser() user: UserDocument) {
    const { city, line1, line2, country, state, postalCode } = await this.addressService.findOneRecord({
      _id: address,
    });
    const cart = await this.cartService.findOne({ creator: user._id });
    const subTotal = cart.items.reduce((n, { item, quantity }) => n + item.price * quantity, 0);
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    const paymentIntent = await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: paymentMethod,
      amount: Math.round(total * 100),
      customer: user.customerId,
      confirm: true,
      shipping: {
        address: {
          city: city,
          line1: line1,
          line2: line2,
          country: country,
          state: state,
          postal_code: postalCode,
        },
        name: `${user.firstName} ${user.lastName}`,
      },
    });

    for (const { item, quantity } of cart.items) {
      await this.saleService.createRecord({
        //@ts-ignore
        product: item._id,
        customer: user._id,
        seller: item.creator,
        price: item.price,
        quantity,
        productType: ProductType.PHYSICAL,
      });
    }

    for (const { item, quantity, selectedColor, selectedSize } of cart.items) {
      await this.orderService.createRecord({
        customer: user._id,
        address: address,
        //@ts-ignore
        product: item._id,
        quantity: quantity,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
        paymentMethod,
        seller: item.creator,
        paymentIntent: paymentIntent.id,
        orderNumber: this.orderService.getOrderNumber(),
      });
    }

    await this.cartService.deleteSingleRecord({ creator: user._id });
    return { message: 'Order placed successfully.' };
  }

  @Post('buy')
  async buyProduct(@GetUser() user: UserDocument, @Body() buyProductDto: BuyProductDto) {
    const product = await this.productService
      .findOneRecord({ _id: buyProductDto.product })
      .populate({ path: 'creator', select: 'sellerId' });
    if (!product) throw new HttpException('Product does not exists.', HttpStatus.BAD_REQUEST);
    const subTotal = product.price;
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: buyProductDto.paymentMethod,
      amount: Math.round(total * 100),
      customer: user.customerId,
      confirm: true,
      transfer_data: { destination: product.creator.sellerId },
      application_fee_amount: Math.round((2 / 100) * total),
      description: `payment intent of product ${product.title}`,
    });
    await this.saleService.createRecord({
      productType: ProductType.DIGITAL,
      customer: user._id,
      //@ts-ignore
      seller: product.creator._id,
      price: product.price,
      product: product._id,
    });
    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { boughtDigitalProducts: product._id } });
    return { message: 'Thanks for purchasing the product.' };
  }

  //-----------------------------------------------collection apis---------------------------------------
  @Post('collection/create')
  async createCollection(@Body() createCollectionDto: CreateCollectionDto, @GetUser() user: UserDocument) {
    const collection = await this.collectionService.createRecord({
      ...createCollectionDto,
      creator: user._id,
    });

    let products;
    // check if collection type is automated
    if (collection.type === CollectionTypes.AUTOMATED) {
      //check if collection condition is any
      if (collection.conditions === CollectionConditions.ANY) {
        products = await this.productService.findAllRecords({
          tags: { $in: collection.tags },
        });
      } else if (collection.conditions === CollectionConditions.All) {
        products = await this.productService.findAllRecords({
          tags: { $all: collection.tags },
        });
      }
      return await this.collectionService.findOneRecordAndUpdate({ _id: collection._id }, { $push: { products } });
    }
    return collection;
  }

  @Get('collection/find-all')
  async findAllCollections(
    @Query('type', new ParseEnumPipe(['automated', 'manual', 'all']))
    type: string,
    @GetUser() user: UserDocument
  ) {
    let collections: CollectionDocument[];
    if (type === 'all') {
      collections = await this.collectionService.findAllCollections({
        creator: user._id,
      });
    } else {
      collections = await this.collectionService.findAllCollections({
        type: type,
        creator: user._id,
      });
    }
    return collections;
  }

  @Get('collection/find-one')
  async findOneCollections(@GetUser() user: UserDocument) {
    return await this.collectionService.findOneRecord({ creator: user._id });
  }

  @Put('collection/add-product')
  async addProduct(@Body() { collection, product }: AddProductDto) {
    return await this.collectionService.findOneRecordAndUpdate({ _id: collection }, { $push: { products: product } });
  }

  // categories apis
  @Roles(UserRoles.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const { value, ...rest } = createProductCategoryDto;
    const category = await this.categoryService.findOneRecord({
      title: createProductCategoryDto.title,
    });
    if (category) throw new HttpException('Category already exists with this title.', HttpStatus.BAD_REQUEST);
    return await this.categoryService.createRecord({ ...rest });
  }

  @Get('category/find-all')
  async findAllCategories(@Query() query) {
    return await this.categoryService.findAllRecords(query);
  }

  @Delete('category/:id/delete')
  async deleteCategory(@Param('id', ParseObjectId) id: string) {
    return await this.categoryService.deleteSingleRecord({ _id: id });
  }

  // ----------------------------------------------------------------cart apis -----------------------------------------------

  @Get('cart')
  async findCart(@GetUser() user: UserDocument) {
    const cart = await this.cartService.findOne({ creator: user._id });
    if (!cart) return { message: 'Your cart is empty.' };
    const subTotal = cart.items.reduce((n, { item, quantity }) => n + item.price * quantity, 0);
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    return { ...cart, subTotal, total, tax };
  }

  @Post(':id/add-to-cart')
  async addItem(
    @GetUser() user: UserDocument,
    @Param('id', ParseObjectId) id: string,
    @Body() { selectedColor, selectedSize }: AddToCartDto
  ) {
    const product = await this.productService.findOneRecord({ _id: id });
    if (!product) throw new HttpException('Product does not exists', HttpStatus.BAD_REQUEST);
    const cart = await this.cartService.findOneRecord({ creator: user._id });
    // check if item is added first time then create a cart object.
    if (!cart) {
      return await this.cartService.createRecord({
        creator: user._id,
        items: [{ item: id, selectedColor, selectedSize }],
      });
      // otherwise add item in items array
    } else {
      //@ts-ignore
      const item = cart.items.find((item) => item.item == id);
      if (item) throw new HttpException('You already added this item in cart.', HttpStatus.BAD_REQUEST);
      return await this.cartService.findOneRecordAndUpdate(
        { creator: user._id },
        { $push: { items: { item: id, selectedColor, selectedSize } } }
      );
    }
  }

  @Put(':id/remove-from-cart')
  async removeProduct(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.cartService.findOneRecordAndUpdate({ creator: user._id }, { $pull: { items: { item: id } } });
  }

  @Put(':id/cart/inc-dec')
  async increaseDecreaseItem(
    @Param('id', ParseObjectId) id: string,
    @GetUser() user: UserDocument,
    @Query('inc') inc: string,
    @Query('dec') dec: string
  ) {
    await this.productService.findOneRecord({ _id: id });
    if (!inc && !dec) throw new HttpException('inc or dec query string is required', HttpStatus.BAD_REQUEST);
    const cart = await this.cartService.update(
      { 'items.item': id, creator: user._id },
      { $inc: { 'items.$.quantity': inc ? 1 : -1 } }
    );
    const subTotal = cart.items.reduce((n, { item, quantity }) => n + item.price * quantity, 0);
    const tax = Math.round((2 / 100) * subTotal);
    const total = subTotal + tax;
    return { ...cart, total, tax, subTotal };
  }

  // ------------------------------------------------------------showcase products apis---------------------------------------------------------------
  @Roles(UserRoles.ADMIN)
  @Post('showcase/create')
  async createShowcaseProduct(@Body() createProductDto: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.create({ ...createProductDto, creator: user._id, isShowCase: true });
  }

  @Roles(UserRoles.ADMIN)
  @Delete('showcase/:id/delete')
  async deleteShowcaseProduct(@Param('id', ParseObjectId) id: string) {
    await this.productService.deleteSingleRecord({ _id: id });
    return { message: 'Product deleted successfully.' };
  }

  @Roles(UserRoles.ADMIN)
  @Put('showcase/:id/update')
  async updateShowcaseProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService.findOneRecordAndUpdate({ _id: id }, updateProductDto);
  }

  @Get('showcase/find-all')
  async findAllShowcaseProducts() {
    return await this.productService.findAllRecords({ isShowCase: true });
  }
}
