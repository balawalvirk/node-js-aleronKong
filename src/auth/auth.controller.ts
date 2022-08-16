import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { hash } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { GetUser } from 'src/helpers/decorators/user.decorator';
import { UserDocument } from 'src/users/users.schema';
import { LoginDto } from './dtos/login';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() body: LoginDto, @GetUser() user: UserDocument) {
    const { access_token } = await this.authService.login(user.userName, user._id);
    return { access_token, user };
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    const emailExists = await this.usersService.findOne({ email: body.email });
    if (emailExists)
      throw new HttpException('User already exists with this email.', HttpStatus.BAD_REQUEST);
    const hashedPassword = await hash(body.password, 10);
    const user = await this.usersService.create({ ...body, password: hashedPassword });
    return { msg: 'User registered successfully.', user };
  }
}
