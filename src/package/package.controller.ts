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
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { GetUser, ParseObjectId, StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PackageDocument } from './package.schema';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/types';
import { FindAllPackagesQueryDto } from './dto/find-all-query.dto';

@Controller('package')
@UseGuards(JwtAuthGuard)
export class PackageController {
  constructor(
    private readonly packageService: PackageService,
    private readonly stripeService: StripeService,
    private readonly userService: UsersService
  ) {}

  @Post('create')
  async create(@Body() createPackageDto: CreatePackageDto, @GetUser() user: UserDocument) {
    //check if package is guild package then only admin can create this package.
    if (createPackageDto.isGuildPackage) {
      if (!user.role.includes(UserRole.ADMIN)) throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    }

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

  @Get('/find-all')
  async findAllPackages(@Query() findAllPackagesQueryDto: FindAllPackagesQueryDto) {
    return await this.packageService.findAllRecords(findAllPackagesQueryDto);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() updatePackageDto: UpdatePackageDto, @GetUser() user: UserDocument) {
    const packageFound: PackageDocument = await this.packageService.findOneRecord({ _id: id });
    //check if package is guild package then only admin can create this package.
    if (packageFound.isGuildPackage) {
      if (!user.role.includes(UserRole.ADMIN)) throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    }

    // check if package price is changed
    if (packageFound.price === updatePackageDto.price) {
      await this.stripeService.updateProduct(packageFound.productId, {
        name: updatePackageDto.title,
        description: updatePackageDto.description,
        images: [updatePackageDto.media],
      });
      return await this.packageService.findOneRecordAndUpdate({ _id: packageFound._id }, updatePackageDto);
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
    const pkg = await this.packageService.findOneRecord({ _id: id }).populate({ path: 'creator', select: 'sellerId' });

    //check if user already subscribed to this package.
    const pkgFound = pkg.buyers.find((buyer) => buyer.toString() == user._id);
    if (pkgFound) throw new HttpException('You are already subscriber of this pacakge.', HttpStatus.BAD_REQUEST);
    const userFound = await this.userService
      .findOneRecord({ _id: user._id })
      .populate({ path: 'supportingPackages', select: 'creator' });

    //check if userhas more than one packages of same authors
    const authorFound = userFound.supportingPackages.find((pkg) => pkg.creator === pkg.creator._id);
    if (authorFound)
      throw new HttpException('You already subscribed to one of the packages of this owner.', HttpStatus.BAD_REQUEST);

    // create subscription in stripe platform
    await this.stripeService.createSubscription({
      customer: user.customerId,
      items: [{ price: pkg.priceId }],
      currency: 'usd',
      transfer_data: {
        destination: pkg.creator.sellerId,
      },
    });
    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $push: { supportingPackages: pkg._id } });
    return await this.packageService.findOneRecordAndUpdate({ _id: id }, { $push: { buyers: user._id } });
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const pkg: PackageDocument = await this.packageService.findOneRecord({ _id: id });

    //check if package is guild package then only admin can create this package.
    if (pkg.isGuildPackage) {
      if (!user.role.includes(UserRole.ADMIN)) throw new HttpException('Forbidden resource', HttpStatus.FORBIDDEN);
    }
    await this.stripeService.updateProduct(pkg.productId, { active: false });
    await this.stripeService.updatePrice(pkg.priceId, { active: false });
    const subscriptions = await this.stripeService.findAllSubscriptions({
      price: pkg.priceId,
    });
    //cancel all subscriptions
    for (const subscription of subscriptions.data) {
      await this.stripeService.cancelSubscription(subscription.id);
    }
    await this.userService.updateManyRecords(
      { supportingPackages: { $in: [pkg._id] } },
      { $pull: { supportingPackages: pkg._id } }
    );

    return await this.packageService.findOneRecordAndUpdate({ _id: id }, { isDeleted: true });
  }

  //find all authors you support
  @Get('author/find-all')
  async findAllAuthors(@GetUser() user: UserDocument) {
    return await this.packageService.findAllAuthors(user._id);
  }

  //stop supporting author
  @Patch('unsubscribe/:id')
  async unSubscribePackage(@Param('id', ParseObjectId) id: string, @GetUser() user) {
    const pkg = await this.packageService.findOneRecord({ _id: id });
    if (!pkg) throw new BadRequestException('Package not found');

    //check if user is subscriber of this package.
    const pkgExists = user.supportingPackages.find((pkg) => pkg == id);
    if (!pkgExists) throw new HttpException('You are not subscriber of this package.', HttpStatus.BAD_REQUEST);
    const subscriptions = await this.stripeService.findAllSubscriptions({
      customer: user._id,
      price: pkg.priceId,
    });
    await this.stripeService.cancelSubscription(subscriptions.data[0].id);
    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { $pull: { supportingPackages: pkg._id } });
    await this.packageService.findOneRecordAndUpdate({ _id: id }, { $pull: { buyers: user._id } });
    return 'Subscription cancelled successfully.';
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
