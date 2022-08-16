import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { IEnvironmentVariables } from 'src/types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService<IEnvironmentVariables>
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    const match = await compare(pass, user.password);
    if (user && match) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(userName: string, userId: string) {
    const payload = { username: userName, sub: userId };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_TOKEN_SECRET'),
      }),
    };
  }
}
