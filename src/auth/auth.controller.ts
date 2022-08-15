import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { hash } from 'bcrypt';

import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { LoginDto, RegisterDto } from './auth.dto';
import { GetUser } from 'src/decorators/user.decorator';
import { UserDocument } from 'src/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @GetUser() user: UserDocument) {
    const { access_token } = await this.authService.login(user.userName, user._id);
    return { access_token, user };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const emailExists = await this.userService.findOne({ email: body.email });
    if (emailExists)
      throw new HttpException('User already exists with this email.', HttpStatus.BAD_REQUEST);
    const hashedPassword = await hash(body.password, 10);
    const user = await this.userService.create({ ...body, password: hashedPassword });
    return { msg: 'User registered successfully.', user };
  }
}
