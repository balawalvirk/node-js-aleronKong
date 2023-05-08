import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { AddressService } from 'src/address/address.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { CartService } from 'src/product/cart.service';
import { makeQuery, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { NotificationType, ProductType, UserRoles } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { ProductCategoryService } from './category.service';
import { CreateProductCategoryDto } from './dtos/create-category.dto';
import { CreateCheckoutDto } from './dtos/create-checkout.dto';
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

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly stripeService: StripeService,
    private readonly addressService: AddressService,
    private readonly categoryService: ProductCategoryService,
    private readonly cartService: CartService,
    private readonly orderService: OrderService,
    private readonly saleService: SaleService,
    private readonly userService: UsersService,
    private readonly reviewService: ReviewService,
    private readonly notificationService: NotificationService,
    private readonly firebaseService: FirebaseService
  ) {}

  @Post('create')
  async create(@Body() createProductDto: CreateProductDto, @GetUser() user: UserDocument) {
    if (createProductDto.webSeries) {
      createProductDto.series = createProductDto.series.map((series) => (series.price === 0 ? { ...series, isFree: true } : series));
    }

    return await this.productService.create(
      createProductDto.price === 0 ? { ...createProductDto, isFree: true, creator: user._id } : { ...createProductDto, creator: user._id }
    );
  }

  @Delete(':id/delete')
  async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const productFound = await this.productService.findOneRecord({ _id: id });
    // check if user is creator of this product or user is admin.
    if (productFound.creator == user._id.toString() || user.role.includes(UserRoles.ADMIN)) {
      const product = await this.productService.deleteSingleRecord({ _id: id });
      await this.saleService.deleteManyRecord({ product: product._id });
      if (product.type === ProductType.DIGITAL)
        await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { boughtDigitalProducts: product._id } });
      return product;
    } else throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
  }

  @Put(':id/update')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @GetUser() user: UserDocument) {
    const product = await this.productService.findOneRecord({ _id: id });
    if (!product) throw new HttpException('Product does not exists.', HttpStatus.BAD_REQUEST);
    if (product.creator != user._id.toString()) throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    return await this.productService.update({ _id: id }, updateProductDto);
  }

  @Get('find-all')
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAllProducts(@Query() { page, limit, ...rest }: FindAllProductsQuery) {
    const $q = makeQuery({ page, limit });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const products = await this.productService.find(rest, options);
    const total = await this.productService.countRecords(rest);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: products,
    };
    return paginated;
  }

  @Get(':id/find-one')
  async findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
    const product = await this.productService.findOneRecord({ _id: id }).populate('category');
    if (!product) throw new BadRequestException('Product does not exists.');
    //@ts-ignore
    const webSeries = user?.boughtWebSeries?.find((series) => series.toString() == id);
    if (webSeries) {
      const series: string[] = [];
      const sales = await this.saleService.findAllRecords({ customer: user._id, product: id });
      const boughtSeries = sales.map((sale) => [...series, ...sale.series]).flat();
      const result = { ...product, boughtSeries };
      return result;
    } else return product;
  }

  // find user store products and all store products
  @Get('store')
  async findStoreProducts(@Query() { showBoughtProducts, ...rest }: FindStoreProductsQueryDto, @GetUser() user: UserDocument) {
    const ObjectId = mongoose.Types.ObjectId;
    // if showboughtproducts is true then show user bought products in categories form else show store products in categories form
    if (!showBoughtProducts) {
      //loop through rest object and convert id string to mongo id
      Object.keys(rest).forEach((key) => (rest[key] = new ObjectId(rest[key])));
      return await this.productService.findStoreProducts(rest);
    } else {
      //@ts-ignore
      const totalProducts = [...user.boughtDigitalProducts, ...user.boughtWebSeries].map((product) => new ObjectId(product));
      return await this.productService.findStoreProducts({ _id: { $in: totalProducts } });
    }
  }

  @Post('checkout')
  async checkout(@Body() { paymentMethod, address }: CreateCheckoutDto, @GetUser() user: UserDocument) {
    const { city, line1, line2, country, state, postalCode } = await this.addressService.findOneRecord({ _id: address });
    const cart = await this.cartService.findOne({ creator: user._id });
    const { total } = this.cartService.calculateTax(cart.items);
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

    await this.cartService.deleteSingleRecord({ creator: user._id });

    for (const { item, quantity } of cart.items) {
      await this.saleService.createRecord({
        //@ts-ignore
        product: item._id,
        customer: user._id,
        //@ts-ignore
        seller: item.creator._id,
        price: item.price,
        quantity,
        productType: ProductType.PHYSICAL,
      });
    }

    for (const { item, quantity, selectedColor, selectedSize } of cart.items) {
      const order = await this.orderService.createRecord({
        customer: user._id,
        address: address,
        //@ts-ignore
        product: item._id,
        quantity: quantity,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
        paymentMethod,
        //@ts-ignore
        seller: item.creator._id,
        paymentIntent: paymentIntent.id,
        orderNumber: this.orderService.getOrderNumber(),
      });
      await this.notificationService.createRecord({
        order: order._id,
        sender: user._id,
        //@ts-ignore
        receiver: item.creator._id,
        message: 'has placed an order',
        type: NotificationType.ORDER_PLACED,
      });
      if (item.creator.fcmToken) {
        await this.firebaseService.sendNotification({
          token: item.creator.fcmToken,
          notification: {
            title: `${user.firstName} ${user.lastName} has placed an order`,
          },
          data: { order: order._id.toString(), type: NotificationType.ORDER_PLACED },
        });
      }
    }

    return { message: 'Order placed successfully.' };
  }

  @Post('buy')
  async buyProduct(@GetUser() user: UserDocument, @Body() buyProductDto: BuyProductDto) {
    const product = await this.productService.findOne({ _id: buyProductDto.product });
    if (!product) throw new HttpException('Product does not exists.', HttpStatus.BAD_REQUEST);
    const { total, applicationFeeAmount } = this.productService.calculateTax(product.price, product.category.commission);
    await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: buyProductDto.paymentMethod,
      amount: total,
      customer: user.customerId,
      confirm: true,
      transfer_data: { destination: product.creator.sellerId },
      application_fee_amount: applicationFeeAmount,
      description: `Payment of product ${product.title}`,
    });
    await this.saleService.createRecord({
      productType: ProductType.DIGITAL,
      customer: user._id,
      //@ts-ignore
      seller: product.creator._id,
      price: product.price,
      product: product._id,
    });
    await this.notificationService.createRecord({
      product: product._id,
      sender: user._id,
      //@ts-ignore
      receiver: product.creator._id,
      type: NotificationType.PRODUCT_BOUGHT,
      message: 'has bought your product.',
    });

    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { boughtDigitalProducts: product._id } });
    if (product.creator.fcmToken) {
      await this.firebaseService.sendNotification({
        token: product.creator.fcmToken,
        notification: {
          title: `${user.firstName} ${user.lastName} has bought your product.`,
        },
        data: { product: product._id.toString(), type: NotificationType.PRODUCT_BOUGHT },
      });
    }

    return { message: 'Thanks for purchasing the product.' };
  }

  @Post('buy-series')
  async buySeries(@GetUser() user: UserDocument, @Body() buySeriesDto: BuySeriesDto) {
    const product = await this.productService.findOne({ _id: buySeriesDto.product });
    if (!product) throw new HttpException('Product does not exists.', HttpStatus.BAD_REQUEST);
    //@ts-ignore
    const series = product.series.filter((series) => buySeriesDto.series.includes(series._id.toString()));

    // check if series does not found then throw exception
    if (series.length === 0) throw new BadRequestException('Series does not exists.');
    const subTotal = series.reduce((n, { price }) => n + price, 0);
    const { total, applicationFeeAmount } = this.productService.calculateTax(subTotal, product.category.commission);
    //@ts-ignore
    const allSeries = series.map((series) => series._id);

    await this.stripeService.createPaymentIntent({
      currency: 'usd',
      payment_method: buySeriesDto.paymentMethod,
      amount: total,
      customer: user.customerId,
      confirm: true,
      transfer_data: { destination: product.creator.sellerId },
      application_fee_amount: applicationFeeAmount,
      description: `payment intent of episodes of product ${product.title}`,
    });

    // create sale of series
    await this.saleService.createRecord({
      productType: ProductType.DIGITAL,
      customer: user._id,
      //@ts-ignore
      seller: product.creator._id,
      price: total,
      product: product._id,
      series: allSeries,
    });

    // push the product whose series are in bought web series attribute of user
    const webSeriesExists = user.boughtWebSeries.find((series) => series.toString() == product._id);
    if (!webSeriesExists) await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { boughtWebSeries: product._id } });

    await this.notificationService.createRecord({
      product: product._id,
      sender: user._id,
      //@ts-ignore
      receiver: product.creator._id,
      type: NotificationType.PRODUCT_BOUGHT,
      message: 'has bought your product.',
    });

    if (product.creator.fcmToken) {
      await this.firebaseService.sendNotification({
        token: product.creator.fcmToken,
        notification: {
          title: `${user.firstName} ${user.lastName} has bought your product.`,
        },
        data: { product: product._id.toString(), type: NotificationType.PRODUCT_BOUGHT },
      });
    }

    return { message: 'Thanks for purchasing the products.' };
  }

  @Get('trending/find-all')
  async findAllTrendingProducts(@Query('category', ParseObjectId) category: string) {
    return await this.productService.find({ category }, { sort: { avgRating: -1 } });
  }

  //-----------------------------------------------------------------------categories apis ---------------------------------------------------------
  @Roles(UserRoles.ADMIN)
  @Post('category/create')
  async createCategory(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    const category = await this.categoryService.findOneRecord({ title: createProductCategoryDto.title });
    if (category) throw new BadRequestException('Category with this title already exists.');
    return await this.categoryService.createRecord(createProductCategoryDto);
  }

  @Get('category/find-all')
  async findAllCategories(@Query() { query, limit, page, ...rest }: FindAllCategoriesQueryDto) {
    const $q = makeQuery({ page, limit, query });
    const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
    const rjx = { $regex: $q.query, $options: 'i' };
    const condition = { ...rest, title: rjx };
    const total = await this.categoryService.countRecords(condition);
    const categories = await this.categoryService.findAllRecords(condition, options);
    const paginated = {
      total: total,
      pages: Math.ceil(total / $q.limit),
      page: $q.page,
      limit: $q.limit,
      data: categories,
    };
    return paginated;
  }

  @Roles(UserRoles.ADMIN)
  @Delete('category/:id/delete')
  async deleteCategory(@Param('id', ParseObjectId) id: string) {
    await this.categoryService.deleteSingleRecord({ _id: id });
    return { message: 'Category deleted successfully.' };
  }

  @Roles(UserRoles.ADMIN)
  @Put('category/:id/update')
  async updateCategory(@Param('id', ParseObjectId) id: string, @Body() { title, type }: UpdateProductCategoryDto) {
    await this.categoryService.findOneRecordAndUpdate({ _id: id }, { title, type });
    return { message: 'Category updated successfully.' };
  }

  // ----------------------------------------------------------------cart apis -----------------------------------------------

  @Get('cart')
  async findCart(@GetUser() user: UserDocument) {
    const cart = await this.cartService.findOne({ creator: user._id });
    if (!cart) return { message: 'Your cart is empty.' };
    const { tax, subTotal, total } = this.cartService.calculateTax(cart.items);
    return { ...cart, subTotal, total, tax };
  }

  @Post(':id/add-to-cart')
  async addItem(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string, @Body() { selectedColor, selectedSize }: AddToCartDto) {
    const product = await this.productService.findOneRecord({ _id: id });
    if (!product) throw new HttpException('Product does not exists', HttpStatus.BAD_REQUEST);
    const cartExists = await this.cartService.findOneRecord({ creator: user._id });
    // check if item is added first time then create a cart object.
    if (!cartExists) {
      const cart = await this.cartService.create({ creator: user._id, items: [{ item: id, selectedColor, selectedSize }] });
      const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
      return { ...cart.toJSON(), subTotal, total, tax };
      // otherwise add item in items array
    } else {
      //@ts-ignore
      const item = cartExists.items.find((item) => item.item == id);
      if (item) throw new BadRequestException('You already added this item in cart.');
      const cart = await this.cartService.findOneAndUpdate({ creator: user._id }, { $push: { items: { item: id, selectedColor, selectedSize } } });
      const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
      return { ...cart, total, subTotal, tax };
    }
  }

  @Put(':id/remove-from-cart')
  async removeProduct(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const cart = await this.cartService.findOneAndUpdate({ creator: user._id }, { $pull: { items: { item: id } } });
    const { total, subTotal, tax } = this.cartService.calculateTax(cart.items);
    return { ...cart, total, subTotal, tax };
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
    const cart = await this.cartService.findOneAndUpdate({ 'items.item': id, creator: user._id }, { $inc: { 'items.$.quantity': inc ? 1 : -1 } });
    const { total, tax, subTotal } = this.cartService.calculateTax(cart.items);
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

  // ----------------------------------------------------------reviews apis-----------------------------------------------------------------------------------------
  @Post('review/create')
  async createReview(@GetUser() user: UserDocument, @Body() createReviewDto: CreateReviewDto) {
    const product = await this.productService.findOneRecord({ _id: createReviewDto.product }).populate('reviews');
    if (!product) throw new HttpException('Product does not exists.', HttpStatus.BAD_REQUEST);
    const review = await this.reviewService.createRecord({
      review: createReviewDto.review,
      product: createReviewDto.product,
      rating: createReviewDto.rating,
      creator: user._id,
      order: createReviewDto.order,
    });
    const reviews = [...product.reviews, review];
    const avgRating = Math.round(reviews.reduce((n, { rating }) => n + rating / reviews.length, 0) * 10) / 10;
    await this.productService.findOneRecordAndUpdate({ _id: createReviewDto.product }, { $push: { reviews: review._id }, avgRating });
    return { message: 'Thanks for sharing your review.' };
  }

  @Get(':id/review/find-all')
  async findAllReviews(@Param('id', ParseObjectId) id: string) {
    return await this.reviewService.find({ product: id }, { sort: { createdAt: -1 } });
  }

  // -------------------------------------------------------------------------------- shopify apis------------------------------------------------------
  @Get('shopify/find-all')
  async findAllShopifyProducts(@GetUser() user: UserDocument) {
    const { shopifyAccessToken, shopifyStoreName } = user;
    if (!shopifyAccessToken || !shopifyStoreName) throw new BadRequestException('User does not have required shopify credientals.');
    const shopify = new Shopify({ shopName: shopifyStoreName, accessToken: shopifyAccessToken });
    return await shopify.product.list();
  }
}
