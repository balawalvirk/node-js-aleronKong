import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './otp.schema';
import { EmailService } from 'src/helpers/services/email.service';
import { StripeService } from 'src/helpers';
import { NotificationModule } from 'src/notification/notification.module';
import { ProductModule } from 'src/product/product.module';
import { FileModule } from 'src/file/file.module';
import {GuildService} from "src/guild/guild.service";
import {Guild, GuildSchema} from "src/guild/guild.schema";

@Module({
  imports: [
    UsersModule,
    ProductModule,
    PassportModule,
    NotificationModule,
    FileModule,
    JwtModule.register({
      secret: new ConfigService<IEnvironmentVariables>().get('JWT_TOKEN_SECRET'),
      signOptions: { expiresIn: '15d' },
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema },{name: Guild.name, schema: GuildSchema}]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, EmailService, StripeService,GuildService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
