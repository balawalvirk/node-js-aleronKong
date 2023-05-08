import { BadRequestException, Body, Controller, Ip, Post, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { RegisterDto } from './dtos/register.dto';
import { OtpDocument } from './otp.schema';
import { ResetPasswordDto } from './dtos/reset-pass.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { EmailService } from 'src/helpers/services/email.service';
import { CartService } from 'src/product/cart.service';
import { UserRoles } from 'src/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from 'src/file/file.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly cartService: CartService,
    private readonly fileService: FileService,
    private readonly configService: ConfigService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() user: UserDocument) {
    let paymentMethod = null;
    const { access_token } = await this.authService.login(user.userName, user._id);
    const { unReadMessages, unReadNotifications } = await this.authService.findNotifications(user._id);
    const cart = await this.cartService.findOneRecord({ creator: user._id });
    if (user.defaultPaymentMethod) paymentMethod = await this.authService.findOnePaymentMethod(user.defaultPaymentMethod);
    return {
      access_token,
      user: {
        ...user,
        defaultPaymentMethod: paymentMethod,
        unReadNotifications: unReadNotifications.length,
        unReadMessages: unReadMessages.length,
        cartItems: cart?.items?.length || 0,
      },
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('admin/login')
  async adminLogin(@GetUser() user: UserDocument) {
    if (!user.role.includes(UserRoles.ADMIN)) throw new UnauthorizedException('Invalid email/password.');
    const { access_token } = await this.authService.login(user.userName, user._id);
    return { access_token, user };
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('avatar'))
  async register(@Body() registerDto: RegisterDto, @Ip() ip: string, @UploadedFile() avatar: Express.Multer.File) {
    const emailExists = await this.userService.findOneRecord({ email: registerDto.email });
    if (emailExists) throw new BadRequestException('User already exists with this email.');
    let user: UserDocument;
    // check if avatar is coming from client side
    if (avatar) {
      const key = await this.fileService.upload(avatar);
      registerDto.avatar = `${this.configService.get('S3_URL')}${key}`;
    }

    if (registerDto.firstName && registerDto.lastName && registerDto.email) {
      const customerAccount = await this.userService.createCustomerAccount(registerDto.email, `${registerDto.firstName} ${registerDto.lastName}`);
      user = await this.userService.createRecord({
        ...registerDto,
        password: await hash(registerDto.password, 10),
        customerId: customerAccount.id,
      });
    } else {
      user = await this.userService.createRecord({
        ...registerDto,
        password: await hash(registerDto.password, 10),
      });
    }
    const { access_token } = await this.authService.login(user.userName, user._id);
    return {
      message: 'User registered successfully.',
      data: {
        user: {
          ...user.toJSON(),
          unReadNotifications: 0,
          unReadMessages: 0,
          cartItems: 0,
        },
        access_token,
      },
    };
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    const emailExists = await this.userService.findOneRecord({ email });
    if (emailExists) throw new BadRequestException('User already exists with this email.');
    return { message: 'User does not exist with this email' };
  }

  @Post('social-login')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto, @Ip() ip: string) {
    const userFound = await this.userService.findOneRecord({ email: socialLoginDto.email });
    if (!userFound) {
      const customerAccount = await this.userService.createCustomerAccount(
        socialLoginDto.email,
        `${socialLoginDto.firstName} ${socialLoginDto.lastName}`
      );
      const user: UserDocument = await this.userService.createRecord({
        email: socialLoginDto.email,
        password: await hash(`${new Date().getTime()}`, 10),
        authType: socialLoginDto.authType,
        customerId: customerAccount.id,
        ...socialLoginDto,
      });
      const { access_token } = await this.authService.login(user.userName, user._id);
      return {
        access_token,
        user: { ...user.toJSON(), unReadNotifications: 0, unReadMessages: 0, cartItems: 0 },
        newUser: true,
      };
    } else {
      if (userFound.authType !== socialLoginDto.authType) throw new BadRequestException('User already exists with this email.');
      let paymentMethod = null;
      const { access_token } = await this.authService.login(userFound.userName, userFound._id);
      const { unReadMessages, unReadNotifications } = await this.authService.findNotifications(userFound._id);
      const cart = await this.cartService.findOneRecord({ creator: userFound._id });
      if (userFound.defaultPaymentMethod) {
        paymentMethod = await this.authService.findOnePaymentMethod(userFound.defaultPaymentMethod);
      }
      return {
        access_token,
        user: {
          ...userFound,
          unReadNotifications,
          unReadMessages,
          defaultPaymentMethod: paymentMethod,
          cartItems: cart?.items?.length || 0,
        },
        newUser: false,
      };
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    const userFound = await this.userService.findOneRecord({ email });
    if (!userFound) throw new BadRequestException('Email does not exists.');
    const otp: OtpDocument = await this.authService.createOtp({
      otp: Math.floor(Math.random() * 10000 + 1),
      // 5 min expiration time .
      expireIn: new Date().getTime() + 300 * 1000,
      email,
    });
    const mail = {
      to: email,
      subject: 'Change Password request',
      from: 'awaismehr001@gmail.com',
      text: 'Hello World from NestJS Sendgrid',
      html: `<h1>password reset otp</h1> <br/> ${otp.otp} </br> This otp will expires in 5 minuutes`,
    };
    await this.emailService.send(mail);
    return { message: 'Otp sent to your email.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() { password, otp }: ResetPasswordDto) {
    const otpFound: OtpDocument = await this.authService.findOneOtp({ otp });
    if (!otpFound) throw new BadRequestException('Invalid Otp.');
    const diff = otpFound.expireIn - new Date().getTime();
    if (diff < 0) throw new BadRequestException('Otp expired.');
    await this.userService.findOneRecordAndUpdate({ email: otpFound.email }, { password: await hash(password, 10) });
    return { message: 'Password changed successfully.' };
  }
}
