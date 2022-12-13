import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GuildPackageService } from './guild-package.service';
import { CreateGuildPackageDto } from './dto/create-guild-package.dto';
import { UpdateGuildPackageDto } from './dto/update-guild-package.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { GetUser, ParseObjectId, Roles, StripeService } from 'src/helpers';
import { UserRole } from 'src/types';
import { UserDocument } from 'src/users/users.schema';
import { GuildPackageDocument } from './guild-package.schema';
import { UsersService } from 'src/users/users.service';

@Controller('guild-package')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuildPackageController {
  constructor(
    private readonly guildPackageService: GuildPackageService,
    private readonly stripeService: StripeService,
    private readonly userService: UsersService
  ) {}

  @Roles(UserRole.ADMIN)
  @Post('create')
  async create(
    @Body() createGuildPackageDto: CreateGuildPackageDto,
    @GetUser() user: UserDocument
  ) {
    const product = await this.stripeService.createProduct({
      name: createGuildPackageDto.title,
      description: createGuildPackageDto.description,
      images: [createGuildPackageDto.image],
    });

    const price = await this.stripeService.createPrice({
      currency: 'usd',
      unit_amount: Math.round(createGuildPackageDto.price * 100),
      recurring: { interval: 'month' },
      product: product.id,
    });

    return await this.guildPackageService.createRecord({
      ...createGuildPackageDto,
      creator: user._id,
      priceId: price.id,
      productId: product.id,
    });
  }

  @Roles(UserRole.ADMIN)
  @Put(':id/update')
  async update(
    @Param('id', ParseObjectId) id: string,
    @Body() updateGuildPackageDto: UpdateGuildPackageDto
  ) {
    const packageFound: GuildPackageDocument = await this.guildPackageService.findOneRecord({
      _id: id,
    });
    // check if package price is changed
    if (packageFound.price === updateGuildPackageDto.price) {
      await this.stripeService.updateProduct(packageFound.productId, {
        name: updateGuildPackageDto.title,
        description: updateGuildPackageDto.description,
        images: [updateGuildPackageDto.image],
      });
      return await this.guildPackageService.findOneRecordAndUpdate(
        { _id: packageFound._id },
        updateGuildPackageDto
      );
    } else {
      //make previous stripe price in active
      await this.stripeService.updatePrice(packageFound.priceId, {
        active: false,
      });

      const product = await this.stripeService.updateProduct(packageFound.productId, {
        name: updateGuildPackageDto.title,
        description: updateGuildPackageDto.description,
        images: [updateGuildPackageDto.image],
      });

      const price = await this.stripeService.createPrice({
        currency: 'usd',
        unit_amount: updateGuildPackageDto.price * 100,
        recurring: { interval: 'month' },
        nickname: `Monthly subscription for package ${product.name}.`,
        product: product.id,
      });

      return await this.guildPackageService.findOneRecordAndUpdate(
        { _id: packageFound._id },
        { ...updateGuildPackageDto, priceId: price.id }
      );
    }
  }

  @Get('find-all')
  async findAll() {
    return await this.guildPackageService.findAllRecords();
  }

  @Put(':id/subscribe')
  async subscribe(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
    //@ts-ignore
    const pkg: GuildPackageDocument = await this.guildPackageService
      .findOneRecord({ _id: id })
      .populate({ path: 'creator', select: 'sellerId' });

    // create subscription in stripe platform
    await this.stripeService.createSubscription({
      customer: user.customerId,
      items: [{ price: pkg.priceId }],
      currency: 'usd',
      /**
       * TODO: need to change application fee percentage after confirmation
       */
      transfer_data: {
        destination: pkg.creator.sellerId,
        amount_percent: 80,
      },
    });

    await this.userService.findOneRecordAndUpdate({ _id: user._id }, { isGuildMember: true });
    return await this.guildPackageService.findOneRecordAndUpdate(
      { _id: id },
      { $push: { buyers: user._id } }
    );
  }

  @Put(':id/unsubscribe')
  async unSubscribePackage(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
    const pkg: GuildPackageDocument = await this.guildPackageService.findOneRecord({ _id: id });
    if (pkg) {
      const subscription = await this.stripeService.findAllSubscriptions({
        customer: user._id,
        price: pkg.priceId,
      });
      await this.stripeService.cancelSubscription(subscription.data[0].id);
      await this.guildPackageService.findOneRecordAndUpdate(
        { _id: id },
        { $pull: { buyers: user._id } }
      );
      await this.userService.findOneRecordAndUpdate({ _id: user._id }, { isGuildMember: false });
      return { message: 'Subscription canceled successfully.' };
    }
    throw new HttpException('Package not found', HttpStatus.BAD_REQUEST);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id/delete')
  async remove(@Param('id', ParseObjectId) id: string) {
    const pkg: GuildPackageDocument = await this.guildPackageService.findOneRecord({ _id: id });
    await this.stripeService.updateProduct(pkg.productId, { active: false });
    await this.stripeService.updatePrice(pkg.priceId, { active: false });
    const subscriptions = await this.stripeService.findAllSubscriptions({
      price: pkg.priceId,
    });
    //cancel all subscriptions
    for (const subscription of subscriptions.data) {
      await this.stripeService.cancelSubscription(subscription.id);
    }
    await this.guildPackageService.deleteSingleRecord({ _id: id });
    return { message: 'Package deleted successfully.' };
  }
}
