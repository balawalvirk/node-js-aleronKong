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
import { Notification } from 'src/notification/notification.schema';

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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneRecord({ email });
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

  async createSellerAccount(body: RegisterDto | SocialLoginDto, ip: string) {
    const dob = new Date(body.birthDate);
    /**
     * TODO: need to change this dynamically
     * TODO: following parameters are need to be change
     * TODO: i)ssn_last_4 ii)phone iii)address
     */
    return await this.stripeService.createAccount({
      email: body.email,
      type: 'custom',
      business_type: 'individual',
      business_profile: {
        mcc: '5734',
        product_description: 'aleron kong product description',
      },
      tos_acceptance: { date: Math.floor(Date.now() / 1000), ip: ip },
      country: 'US',
      individual: {
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        ssn_last_4: '0000',
        phone: '+1 800 444 4444',
        dob: {
          year: dob.getFullYear(),
          day: dob.getDate(),
          month: dob.getMonth(),
        },
        address: {
          city: 'Schenectady',
          line1: '123 State St',
          postal_code: '12345',
          state: 'NY',
        },
      },

      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });
  }

  async createCustomerAccount(email: string, name: string) {
    return await this.stripeService.createCustomer({ email, name });
  }

  async findNotifications(userId: string) {
    const Notifications: Notification[] = await this.NotificationService.findAllRecords({
      receiver: userId,
      isRead: false,
    });

    //get un read messages and notifications
    const unReadMessages = Notifications.filter(
      (notification) => notification.type === NotificationType.MESSAGE
    );

    const unReadNotifications = Notifications.filter(
      (notification) => notification.type !== NotificationType.MESSAGE
    );

    return { unReadMessages, unReadNotifications };
  }
}
