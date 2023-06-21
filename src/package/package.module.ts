import { Module } from '@nestjs/common';
import { PackageService } from './package.service';
import { PackageController } from './package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from './package.schema';
import { StripeService } from 'src/helpers';
import { UsersModule } from 'src/users/users.module';
import { FirebaseService } from 'src/firebase/firebase.service';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Package.name, schema: PackageSchema }]), UsersModule, NotificationModule],
  controllers: [PackageController],
  providers: [PackageService, StripeService, FirebaseService],
  exports: [PackageService],
})
export class PackageModule {}
