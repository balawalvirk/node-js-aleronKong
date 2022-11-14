import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './package.schema';
import { StripeService } from 'src/helpers';

@Module({
  imports: [MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }])],
  controllers: [PackageController],
  providers: [PackageService, StripeService],
})
export class PackageModule {}
