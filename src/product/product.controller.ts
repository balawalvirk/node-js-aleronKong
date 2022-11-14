import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AddressDocument } from 'src/address/address.schema';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { CollectionConditions, CollectionTypes, ProductState, ProductTypes } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { CollectionDocument } from './collection.schema';
import { CollectionService } from './collection.service';
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
    // await this.stripeService.createProduct({
    //   name: body.title,
    //   description: body.description,
    //   images: body.media,
    //   default_price_data: {
    //     currency: 'usd',
    //     unit_amount: body.price * 100,
    //   },
    // });
    return await this.productService.createRecord({ ...body, creator: user._id });
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    return await this.productService.deleteSingleRecord({ _id: id });
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productService.findOneRecordAndUpdate({ _id: id }, body);
  }

  @Get('/inventory')
  async inventory(@GetUser() user: UserDocument) {
    await this.productService.findAllRecords({ creator: user._id });
  }

  @Post('create-collection')
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

  @Post('checkout')
  async checkout(
    @Body() { paymentMethod, address, products }: CreateCheckoutDto,
    @GetUser() user: UserDocument
  ) {
    const { city, line1, line2, country, state, postalCode }: AddressDocument =
      await this.addressService.findOneRecord({ _id: address });

    const allProducts: ProductDocument[] = await this.productService.findAllRecords({
      _id: { $in: products },
    });
    const physicalProducts = allProducts.filter(
      (product) => product.state === ProductState.PHYSICAL
    );
    const digitalProducts = allProducts.filter((product) => product.state === ProductState.DIGITAL);

    // if products are digital then immediately transfer that money to seller account.
    // for (const product of digitalProducts) {
    //   await this.stripeService.cancelSubscription(subscription.id);
    // }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      {
        currency: 'usd',
        payment_method: paymentMethod,
        // need to change this dynamically
        amount: 100,
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
         * TODO:need to confirm this application fee amount and seller account
         */
      },
      {}
    );

    return paymentIntent.client_secret;
  }
}

// @Patch('add-product/:id/:productId')
// async addProduct(
//   @Param('id', ParseObjectId) id: string,
//   @Param('productId', ParseObjectId) productId: string
// ) {
//   return await this.collectionService.findOneRecordAndUpdate(
//     { _id: id },
//     { $push: { products: productId } }
//   );
// }
