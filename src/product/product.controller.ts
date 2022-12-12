import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AddressDocument } from 'src/address/address.schema';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { CartService } from 'src/cart/cart.service';
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

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly collectionService: CollectionService,
    private readonly stripeService: StripeService,
    private readonly addressService: AddressService,
    private readonly categoryService: ProductCategoryService
  ) {}

  @Post('create')
  async create(@Body() body: CreateProductDto, @GetUser() user: UserDocument) {
    return await this.productService.create({ ...body, creator: user._id });
  }

  @Delete('/:id/delete')
  async remove(@Param('id', ParseObjectId) id: string) {
    const product: ProductDocument = await this.productService.deleteSingleRecord({ _id: id });
    await this.collectionService.updateManyRecords(
      { products: { $in: [product._id] } },
      { $pull: { products: product._id } }
    );
    return product;
  }

  @Put('/:id/update')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productService
      .findOneRecordAndUpdate({ _id: id }, updateProductDto)
      .populate('category');
  }

  @Get('/inventory')
  async inventory(@GetUser() user: UserDocument) {
    await this.productService.findAllRecords({ creator: user._id });
  }

  @Get('find-all')
  async findAll(
    @GetUser() user: UserDocument,
    @Query('status', new ParseEnumPipe(['all', 'active', 'draft', 'archived'])) status: string
  ) {
    let products = [];
    if (status === 'all') {
      products = await this.productService
        .findAllRecords({ status, creator: user._id })
        .populate('category');
    }
    products = await this.productService
      .findAllRecords({ status, creator: user._id })
      .populate('category');
    return products;
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
        destination: product.creator.sellerId,
        transfer_group,
        description: `${product.title} transfers`,
      });
    }

    return paymentIntent.client_secret;
  }

  //-----------------------------------------------collection apis---------------------------------------
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
      collections = await this.collectionService.findAllCollections({ creator: user._id });
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
    return await this.collectionService.findOneRecordAndUpdate(
      { _id: collection },
      { $push: { products: product } }
    );
  }

  // categories apis
  @Roles(UserRole.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const { value, ...rest } = createProductCategoryDto;
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
}
