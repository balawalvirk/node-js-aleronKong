import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { FilterQuery, Model } from 'mongoose';
import { StripeService } from 'src/helpers';
import { IEnvironmentVariables } from 'src/types';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dtos/register.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { Otp, OtpDocument } from './otp.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<IEnvironmentVariables>,
    private stripeService: StripeService,
    private readonly NotificationService: NotificationService,
    @InjectModel(Otp.name) private otpModal: Model<OtpDocument>
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findOne({ email });
    if (!user) return null;
    const match = await compare(pass, user.password);
    if (!match) return null;
    const { password, ...result } = user;
    return result;
  }

  async login(userName: string, userId: string) {
    const payload = { username: userName, sub: userId };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_TOKEN_SECRET'),
      }),
    };
  }

  AddMinutesToDate(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60000);
  }

  async createOtp(body: any) {
    return await this.otpModal.create(body);
  }

  async findOneOtp(filter?: FilterQuery<any>) {
    return await this.otpModal.findOne(filter);
  }

  async findOnePaymentMethod(id: string) {
    return await this.stripeService.findOnePaymentMethod(id);
  }

  async findNotifications(userId: string) {
    const Notifications = await this.NotificationService.findAllRecords({ receiver: userId, isRead: false });
    const unReadMessages = Notifications.filter((notification) => notification.type === NotificationType.NEW_MESSAGE);
    const unReadNotifications = Notifications.filter((notification) => notification.type !== NotificationType.NEW_MESSAGE);
    return { unReadMessages, unReadNotifications };
  }
}
