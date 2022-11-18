import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddressDocument } from 'src/address/address.schema';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { CollectionConditions, CollectionTypes, ProductState } from 'src/types';
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

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly collectionService: CollectionService,
    private readonly stripeService: StripeService,
    private readonly addressService: AddressService
  ) {}

  @Post('create')
  async create(@Body() body: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.createRecord({ ...body, creator: user._id });
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    const product: ProductDocument = await this.productService.deleteSingleRecord({ _id: id });
    await this.collectionService.updateManyRecords(
      { products: { $in: [product._id] } },
      { $pull: { products: product._id } }
    );
    return product;
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const product = await this.productService.findOneRecordAndUpdate({ _id: id }, updateProductDto);
    return { statusCode: 200, data: product };
  }

  @Get('/inventory')
  async inventory(@GetUser() user: UserDocument) {
    await this.productService.findAllRecords({ creator: user._id });
  }

  @Get('find-all')
  async findAll(
    @GetUser() user: UserDocument,
    @Query('type', new ParseEnumPipe(['all', 'active', 'draft', 'archived'])) type: string
  ) {
    const product = await this.productService.findAllRecords({ type, creator: user._id });
    return { data: product, statusCode: 200 };
  }

  @Post('collection/create')
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
    @GetUser() user: UserDocument
  ) {
    const collection: CollectionDocument = await this.collectionService.createRecord({
      ...createCollectionDto,
      creator: user._id,
    });

    let products: ProductDocument[];
    // check if collection type is automated
    if (collection.type === CollectionTypes.AUTOMATED) {
      //check if collection condition is any
      if (collection.conditions === CollectionConditions.ANY) {
        products = await this.productService.findAllRecords({ tags: { $in: collection.tags } });
      } else if (collection.conditions === CollectionConditions.All) {
        products = await this.productService.findAllRecords({ tags: { $all: collection.tags } });
      }
      return await this.collectionService.findOneRecordAndUpdate(
        { _id: collection._id },
        { $push: { products } }
      );
    }
    return collection;
  }

  @Get('collection/find-all')
  async findAllCollections(
    @Query('type', new ParseEnumPipe(['automated', 'manual', 'all'])) type: string,
    @GetUser() user: UserDocument
  ) {
    let collections: CollectionDocument[];
    if (type === 'all') {
      collections = await this.collectionService.findAllRecords({ creator: user._id }).populate({
        path: 'products',
      });
    } else {
      collections = await this.collectionService.findAllRecords({ type: type, creator: user._id });
    }
    return collections;
  }

  @Patch('collection/add-product')
  async addProduct(@Body() { collection, product }: AddProductDto) {
    return await this.collectionService.findOneRecordAndUpdate(
      { _id: collection },
      { $push: { products: product } }
    );
  }

  @Post('checkout')
  async checkout(
    @Body() { paymentMethod, address, products }: CreateCheckoutDto,
    @GetUser() user: UserDocument
  ) {
    const { city, line1, line2, country, state, postalCode }: AddressDocument =
      await this.addressService.findOneRecord({ _id: address });
    //find all products from database
    const allProducts: ProductDocument[] = await this.productService
      .findAllRecords({
        _id: { $in: products },
      })
      .populate({ path: 'creator', select: 'accountId' });
    //total price of all products
    const totalPrice = allProducts.reduce((n, { price }) => n + price, 0);

    const transfer_group = `${Math.floor(Math.random() * 899999 + 100000)}`;
    //create a payment intent in stripe
    const paymentIntent = await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: paymentMethod,
      amount: totalPrice * 100,
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
      transfer_group,
      application_fee_amount: 500,
    });

    for (const product of allProducts) {
      await this.stripeService.createTransfer({
        amount: product.price,
        currency: 'usd',
        destination: product.creator.accountId,
        transfer_group,
        description: `${product.title} transfers`,
      });
    }

    return paymentIntent.client_secret;
  }
}
