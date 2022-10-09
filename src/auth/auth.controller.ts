import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { LoginDto } from './dtos/login';
import { RegisterDto } from './dtos/register.dto';
import { OtpDocument } from './otp.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { EmailService } from 'src/helpers/email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly emailService: EmailService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @GetUser() user: UserDocument) {
    const { access_token } = await this.authService.login(
      user.userName,
      user._id
    );
    return { access_token, user };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const emailExists = await this.userService.findOneRecord({
      email: body.email,
    });
    if (emailExists)
      throw new HttpException(
        'User already exists with this email.',
        HttpStatus.BAD_REQUEST
      );
    const user = await this.userService.create({
      ...body,
      password: await hash(body.password, 10),
    });
    return { msg: 'User registered successfully.', user };
  }

  @Post('social-login')
  async socialLogin(@Body() body: SocialLoginDto) {
    const userExists: UserDocument = await this.userService.findOneRecord(body);
    if (!userExists) {
      const user: UserDocument = await this.userService.create({
        email: body.email,
        password: await hash(`${new Date().getTime()}`, 10),
      });
      const { access_token } = await this.authService.login(
        user.userName,
        user._id
      );
      return { access_token, user };
    } else {
      const { access_token } = await this.authService.login(
        userExists.userName,
        userExists._id
      );
      return { access_token, user: userExists };
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body('email') email: string): Promise<string> {
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
    return 'Otp sent to your email.';
  }

  @Post('reset-password')
  async resetPassword(
    @Body() { password, otp }: ResetPasswordDto
  ): Promise<string> {
    const otpFound: OtpDocument = await this.authService.findOneOtp({ otp });
    if (!otpFound) throw new BadRequestException('Invalid Otp.');
    const diff = otpFound.expireIn - new Date().getTime();
    if (diff < 0) throw new BadRequestException('Otp expired.');
    await this.userService.findAndUpdate(
      { email: otpFound.email },
      { password }
    );
    return 'Password changed successfully.';
  }
}

//
