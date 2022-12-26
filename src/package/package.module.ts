import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './package.schema';
import { StripeService } from 'src/helpers';
import { UsersModule } from 'src/users/users.module';
import { SaleModule } from 'src/sale/sale.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]), UsersModule, SaleModule],
  controllers: [PackageController],
  providers: [PackageService, StripeService],
})
export class PackageModule {}
