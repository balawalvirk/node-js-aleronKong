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
import { CartService } from 'src/product/cart.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    UsersModule,
    ProductModule,
    PassportModule,
    NotificationModule,
    JwtModule.register({
      secret: new ConfigService<IEnvironmentVariables>().get('JWT_TOKEN_SECRET'),
      signOptions: { expiresIn: '15d' },
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, EmailService, StripeService],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
