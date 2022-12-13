import { Module } from '@nestjs/common';
import { GuildPackageService } from './guild-package.service';
import { GuildPackageController } from './guild-package.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GuildPackage, GuildPackageSchema } from './guild-package.schema';
import { StripeService } from 'src/helpers';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GuildPackage.name, schema: GuildPackageSchema }]),
    UsersModule,
  ],
  controllers: [GuildPackageController],
  providers: [GuildPackageService, StripeService],
  exports: [GuildPackageService],
})
export class GuildPackageModule {}
