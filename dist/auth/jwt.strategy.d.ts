import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IEnvironmentVariables } from 'src/types';
import { UsersService } from 'src/users/users.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private usersService;
    constructor(configService: ConfigService<IEnvironmentVariables>, usersService: UsersService);
    validate(payload: any): Promise<any>;
}
export {};
