import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { UserDocument } from 'src/users/users.schema';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-pass.dto';
import { SocialLoginDto } from './dtos/social-login.dto';
import { EmailService } from 'src/helpers/services/email.service';
import { StripeService } from 'src/helpers';
import { MultipartFile } from '@fastify/multipart';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    private readonly emailService;
    private readonly stripeService;
    constructor(authService: AuthService, userService: UsersService, emailService: EmailService, stripeService: StripeService);
    login(user: UserDocument): Promise<{
        access_token: string;
        user: UserDocument;
    }>;
    Connect(file: MultipartFile): Promise<string>;
    register(body: RegisterDto): Promise<{
        message: string;
        data: {
            user: UserDocument;
            access_token: string;
        };
    }>;
    checkEmail(email: string): Promise<{
        message: string;
    }>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<{
        access_token: string;
        user: UserDocument;
        newUser: boolean;
    }>;
    forgetPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword({ password, otp }: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
