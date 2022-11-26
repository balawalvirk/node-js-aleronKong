import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
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
import { StripeService, UploadGuard, File } from 'src/helpers';
import { MultipartFile } from '@fastify/multipart';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService,
    private readonly stripeService: StripeService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@GetUser() user: UserDocument) {
    const { access_token } = await this.authService.login(user.userName, user._id);
    return { access_token, user };
  }

  @Post('connect')
  @UseGuards(UploadGuard)
  async Connect(@File() file: MultipartFile) {
    console.log({ file });
    return 'this';
    // return await this.stripeService.createAccount({
    //   type: 'custom',
    //   business_type: 'individual',
    //   country: 'US',
    //   individual: {
    //     first_name: 'awais',
    //     last_name: 'mehr',
    //     dob: {
    //       day: 2,
    //       month: 11,
    //       year: 1998,
    //     },
    //     email: 'awaistest@gmail.com',
    //   },
    //   business_profile: {
    //     mcc: '5942',
    //     url: 'https://www.litrpg.com/',
    //   },
    //   tos_acceptance: {
    //     date: 1669128686,
    //     ip: ip,
    //   },
    //   capabilities: {
    //     card_payments: { requested: true },
    //     transfers: { requested: true },
    //   },
    // });
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const emailExists = await this.userService.findOneRecord({ email: body.email });
    if (emailExists)
      throw new HttpException('User already exists with this email.', HttpStatus.BAD_REQUEST);

    // first create stripe connect(express) account and customer account of newly register user.
    // await this.stripeService.createAccount({
    //   email: body.email,
    //   type: 'express',
    //   business_type: 'individual',

    //   capabilities: {
    //     card_payments: {
    //       requested: true,
    //     },
    //     transfers: {
    //       requested: true,
    //     },
    //   },
    // });
    await this.stripeService.createCustomer({
      email: body.email,
      name: `${body.firstName} ${body.lastName}`,
    });
    const user: UserDocument = await this.userService.createRecord({
      ...body,
      password: await hash(body.password, 10),
    });
    const { access_token } = await this.authService.login(user.userName, user._id);
    return {
      message: 'User registered successfully.',
      data: { user, access_token },
    };
  }

  @Post('check-email')
  async checkEmail(@Body('email') email: string) {
    const emailExists = await this.userService.findOneRecord({ email });
    if (emailExists)
      throw new HttpException('User already exists with this email.', HttpStatus.BAD_REQUEST);
    return { message: 'User does not exist with this email' };
  }

  @Post('social-login')
  async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    const userFound: UserDocument = await this.userService.findOneRecord({
      email: socialLoginDto.email,
      authType: socialLoginDto.authType,
    });
    if (!userFound) {
      // first create stripe connect(express) account and customer account of newly register user.
      // await this.stripeService.createAccount({
      //   email: body.email,
      //   type: 'express',
      //   business_type: 'individual',
      //   capabilities: {
      //     card_payments: {
      //       requested: true,
      //     },
      //     transfers: {
      //       requested: true,
      //     },
      //   },
      // });
      await this.stripeService.createCustomer({ email: socialLoginDto.email });
      const user: UserDocument = await this.userService.createRecord({
        email: socialLoginDto.email,
        password: await hash(`${new Date().getTime()}`, 10),
        authType: socialLoginDto.authType,
        ...socialLoginDto,
      });
      const { access_token } = await this.authService.login(user.userName, user._id);
      return { access_token, user, newUser: true };
    } else {
      const { access_token } = await this.authService.login(userFound.userName, userFound._id);
      return { access_token, user: userFound, newUser: false };
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    const userFound = await this.userService.findOneRecord({ email });
    if (!userFound) throw new HttpException('Email does not exists.', HttpStatus.BAD_REQUEST);
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
    if (!otpFound) throw new HttpException('Invalid Otp.', HttpStatus.BAD_REQUEST);
    const diff = otpFound.expireIn - new Date().getTime();
    if (diff < 0) throw new HttpException('Otp expired.', HttpStatus.BAD_REQUEST);
    await this.userService.findOneRecordAndUpdate({ email: otpFound.email }, { password });
    return { message: 'Password changed successfully.' };
  }
}
