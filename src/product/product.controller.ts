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
import { AddressDocument } from 'src/address/address.schema';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { CartService } from 'src/product/cart.service';
import { ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { CollectionConditions, CollectionTypes, UserRole } from 'src/types';
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
import { ProductDocument } from './product.schema';
import { ProductService } from './product.service';
import { OrderService } from 'src/order/order.service';
import { CartDocument } from './cart.schema';
import { SaleService } from 'src/sale/sale.service';

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
    private readonly saleService: SaleService
  ) {}

  @Post('create')
  async create(@Body() body: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.create({ ...body, creator: user._id });
  }

  @Delete(':id/delete')
  async remove(@Param('id', ParseObjectId) id: string) {
    const product: ProductDocument = await this.productService.deleteSingleRecord({ _id: id });
    await this.collectionService.updateManyRecords(
      { products: { $in: [product._id] } },
      { $pull: { products: product._id } }
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
  async findStoreProducts(@Query() query) {
    let condition = {
      ...query,
    };
    // loop through object and convert in into object id
    const ObjectId = mongoose.Types.ObjectId;
    for (const key of Object.keys(query)) {
      if (key === 'creator') {
        condition.creator = new ObjectId(query[key]);
      } else if (key === 'category') {
        condition.category = new ObjectId(query[key]);
      }
    }
    return await this.productService.findStoreProducts(condition);
  }

  @Post('checkout')
  async checkout(@Body() { paymentMethod, address }: CreateCheckoutDto, @GetUser() user: UserDocument) {
    const { city, line1, line2, country, state, postalCode }: AddressDocument = await this.addressService.findOneRecord(
      { _id: address }
    );
    const cart: CartDocument = await this.cartService.findOne({ creator: user._id });
    const subTotal = cart.items.reduce((n, { price }) => n + price, 0);

    const paymentIntent = await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: paymentMethod,
      amount: subTotal * 100,
      customer: user.customerId,
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
      /**
       * TODO:need to change the application fee amount dynamically
       * TODO:currently hardcoded $5 is placed
       */
      // transfer_group,
      application_fee_amount: 500,
    });

    for (const item of cart.items) {
      await this.saleService.createRecord({
        // @ts-ignore
        product: item.item._id,
        customer: user._id,
        price: item.price,
        buyer: item.item.creator,
      });
    }

    await this.orderService.createRecord({
      customer: user._id,
      address: address,
      subTotal,
      paymentIntent: paymentIntent.client_secret,
      items: cart.items,
    });

    await this.cartService.findOneRecordAndUpdate({ creator: user._id }, { $set: { items: [] } });

    return { message: 'Order placed successfully.' };
  }

  //-----------------------------------------------collection apis---------------------------------------
  @Post('collection/create')
  async createCollection(@Body() createCollectionDto: CreateCollectionDto, @GetUser() user: UserDocument) {
    const collection: CollectionDocument = await this.collectionService.createRecord({
      ...createCollectionDto,
      creator: user._id,
    });

    let products: ProductDocument[];
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
  @Roles(UserRole.ADMIN)
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
  async findOne(@GetUser() user: UserDocument) {
    return await this.cartService.findOne({ creator: user._id });
  }

  @Post(':id/add-to-cart')
  async addItem(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    const product: ProductDocument = await this.productService.findOneRecord({
      _id: id,
    });
    if (!product) throw new HttpException('Product does not exists', HttpStatus.BAD_REQUEST);
    const cart = await this.cartService.findOneRecord({ creator: user._id });
    // check if item is added first time then create a cart object.
    if (!cart) {
      return await this.cartService.createRecord({
        creator: user._id,
        items: [
          {
            item: id,
            quantity: 1,
            price: product.price,
          },
        ],
      });
      // otherwise add item in items array
    } else {
      const item = cart.items.find((item) => item.item == id);
      if (item) throw new HttpException('You already added this item in cart.', HttpStatus.BAD_REQUEST);
      return await this.cartService.findOneRecordAndUpdate(
        { creator: user._id },
        {
          $push: { items: { item: id, quantity: 1, price: product.price } },
        }
      );
    }
  }

  @Put(':id/remove-from-cart')
  async removeProduct(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    return await this.cartService.findOneRecordAndUpdate(
      { creator: user._id },
      {
        $pull: { items: { item: id } },
      }
    );
  }

  @Put(':id/cart/inc-dec')
  async increaseDecreaseItem(
    @Param('id', ParseObjectId) id: string,
    @GetUser() user: UserDocument,
    @Query('inc') inc: string,
    @Query('dec') dec: string
  ) {
    const product = await this.productService.findOneRecord({ _id: id });
    if (!inc && !dec) throw new HttpException('inc or dec query string is required', HttpStatus.BAD_REQUEST);
    let updateQuery = {};
    if (inc)
      updateQuery = {
        $inc: { 'items.$.quantity': 1, 'items.$.price': product.price },
      };
    else
      updateQuery = {
        $inc: { 'items.$.quantity': -1, 'items.$.price': -product.price },
      };
    return await this.cartService.update({ 'items.item': id, creator: user._id }, updateQuery);
  }
}
