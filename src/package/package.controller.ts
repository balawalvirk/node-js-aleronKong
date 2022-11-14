import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { GetUser, ParseObjectId, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PackageDocument } from './package.schema';

@Controller('package')
@UseGuards(JwtAuthGuard)
export class PackageController {
  constructor(
    private readonly packageService: PackageService,
    private readonly stripeService: StripeService
  ) {}

  @Post('create')
  async create(@Body() createPackageDto: CreatePackageDto, @GetUser() user: UserDocument) {
    const product = await this.stripeService.createProduct({
      name: createPackageDto.title,
      description: createPackageDto.description,
      images: [createPackageDto.media],
    });

    const price = await this.stripeService.createPrice({
      currency: 'usd',
      unit_amount: createPackageDto.price * 100,
      recurring: { interval: 'month' },
      product: product.id,
    });

    return await this.packageService.createRecord({
      ...createPackageDto,
      creator: user._id,
      priceId: price.id,
      productId: product.id,
    });
  }

  @Get('find-all')
  async findAll(@GetUser() user: UserDocument) {
    return await this.packageService.findAllRecords({ creator: user._id });
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @GetUser() user: UserDocument
  ) {
    const packageFound: PackageDocument = await this.packageService.findOneRecord({ _id: id });
    // check if package price is changed
    if (packageFound.price === updatePackageDto.price) {
      await this.stripeService.updateProduct(packageFound.productId, {
        name: updatePackageDto.title,
        description: updatePackageDto.description,
        images: [updatePackageDto.media],
      });
      return await this.packageService.findOneRecordAndUpdate(
        { _id: packageFound._id },
        updatePackageDto
      );
    } else {
      //make previous stripe price in active
      await this.stripeService.updatePrice(packageFound.priceId, {
        active: false,
      });

      const product = await this.stripeService.updateProduct(packageFound.productId, {
        name: updatePackageDto.title,
        description: updatePackageDto.description,
        images: [updatePackageDto.media],
      });

      const price = await this.stripeService.createPrice({
        currency: 'usd',
        unit_amount: updatePackageDto.price * 100,
        recurring: { interval: 'month' },
        nickname: `Monthly subscription for package ${product.name}.`,
        product: product.id,
      });

      return await this.packageService.findOneRecordAndUpdate(
        { _id: packageFound._id },
        { ...updatePackageDto, priceId: price.id }
      );
    }
  }

  @Patch('subscribe/:id')
  async subscribe(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    //@ts-ignore
    const pkg: PackageDocument = await this.packageService
      .findOneRecord({ _id: id })
      .populate({ path: 'creator', select: 'accountId' });

    // create subscription in stripe platform
    await this.stripeService.createSubscription({
      customer: user.customerId,
      items: [{ price: pkg.priceId }],
      currency: 'usd',
      transfer_data: {
        destination: pkg.creator.accountId,
      },
    });

    return await this.packageService.findOneRecordAndUpdate(
      { _id: id },
      { $push: { buyers: user._id } }
    );
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseObjectId) id: string) {
    const pkg: PackageDocument = await this.packageService.findOneRecord({ _id: id });
    await this.stripeService.updateProduct(pkg.productId, { active: false });
    await this.stripeService.updatePrice(pkg.priceId, { active: false });
    const subscriptions = await this.stripeService.findAllSubscriptions({
      price: pkg.priceId,
    });
    //cancel all subscriptions
    for (const subscription of subscriptions.data) {
      await this.stripeService.cancelSubscription(subscription.id);
    }
    return await this.packageService.deleteSingleRecord({ _id: id });
  }

  //find all authors you support
  @Get('author/find-all')
  async findAllAuthors(@GetUser() user: UserDocument) {
    return await this.packageService.findAllAuthors(user._id);
  }

  //stop supporting author
  @Patch('unsubscribe/:id')
  async unSubscribePackage(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const pkg: PackageDocument = await this.packageService.findOneRecord({ _id: id });
    if (pkg) {
      const subscription = await this.stripeService.findAllSubscriptions({
        customer: user._id,
        price: pkg.priceId,
      });
      await this.stripeService.cancelSubscription(subscription.data[0].id);
      await this.packageService.findOneRecordAndUpdate(
        { _id: id },
        { $pull: { buyers: user._id } }
      );
      return 'Subscription canceled successfully.';
    }
    throw new BadRequestException('Package not found');
  }

  @Get('find-one/:id')
  async findOne(@Param('id', ParseObjectId) id: string) {
    return await this.packageService.findOneRecord({ _id: id });
  }

  @Get('membership')
  async findMembership(@GetUser() user: UserDocument) {
    /**
     * TODO:query product form local database and get product Id from params
     */

    const priceId: string = 'price_1M1PKmLyEqAWCXHoxHWq7yYw';
    /**
     * TODO: need to add application percent fee.
     */
    const subscriptions = await this.stripeService.findAllSubscriptions({
      customer: user.customerId,
      price: priceId,
    });
    const invoices = await this.stripeService.findAllInvoices({
      subscription: subscriptions.data[0].id,
    });

    const desiredInvoices = invoices.data.map((invoice) => ({
      id: invoice.id,
      created: invoice.created,
      amount_paid: invoice.amount_paid,
    }));

    return {
      subscription: {
        id: subscriptions.data[0].id,
        current_period_end: subscriptions.data[0].current_period_end,
      },
      invoices: desiredInvoices,
    };
  }
}
