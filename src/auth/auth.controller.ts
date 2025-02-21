import {
    BadRequestException,
    Body,
    Controller, InternalServerErrorException,
    Ip, NotFoundException,
    Post,
    UnauthorizedException,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {hash} from 'bcrypt';
import {UsersService} from '../users/users.service';
import {AuthService} from './auth.service';
import {LocalAuthGuard} from './local-auth.guard';
import {GetUser} from 'src/helpers/decorators/user.decorator';
import {UserDocument} from 'src/users/users.schema';
import {RegisterDto} from './dtos/register.dto';
import {OtpDocument} from './otp.schema';
import {ResetPasswordDto} from './dtos/reset-pass.dto';
import {LoginWithSocialDto, SocialLoginDto} from './dtos/social-login.dto';
import {EmailService} from 'src/helpers/services/email.service';
import {CartService} from 'src/product/cart.service';
import {AuthTypes, UserRoles} from 'src/types';
import {FileInterceptor} from '@nestjs/platform-express';
import {FileService} from 'src/file/file.service';
import {ConfigService} from '@nestjs/config';
import {GuildService} from "src/guild/guild.service";
import verifyAppleToken from "verify-apple-id-token";
import {createRemoteJWKSet, jwtVerify} from "jose";
const axios=require('axios');
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService,
        private readonly emailService: EmailService,
        private readonly cartService: CartService,
        private readonly fileService: FileService,
        private readonly configService: ConfigService,
        private readonly guildService: GuildService,

    ) {
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@GetUser() user: any) {
        let paymentMethod = null;
        const {access_token} = await this.authService.login(user.userName, user._id);
        const cart = await this.cartService.findOneRecord({creator: user._id});

        const guild = await this.guildService.findAllRecords({creator: user._id});
        user.guildProfile = guild;


        if (user.defaultPaymentMethod) paymentMethod = await this.authService.findOnePaymentMethod(user.defaultPaymentMethod);
        return {
            access_token,
            user: {
                ...user,
                defaultPaymentMethod: paymentMethod,
                cartItems: cart?.items?.length || 0,
            },
        };
    }

    @UseGuards(LocalAuthGuard)
    @Post('admin/login')
    async adminLogin(@GetUser() user: UserDocument) {
        if (!user.role.includes(UserRoles.ADMIN)) throw new UnauthorizedException('Invalid email/password.');
        const {access_token} = await this.authService.login(user.userName, user._id);
        return {access_token, user};
    }

    @Post('register')
    @UseInterceptors(FileInterceptor('avatar'))
    async register(@Body() registerDto: RegisterDto, @Ip() ip: string, @UploadedFile() avatar: Express.Multer.File) {
        const emailExists = await this.userService.findOneRecord({email: registerDto.email});
        if (emailExists) throw new BadRequestException('User already exists with this email.');

        const userNameExist = await this.userService.findOneRecord({userName: registerDto.userName});
        if (userNameExist) throw new BadRequestException('User already exists with this username.');



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
        const {access_token} = await this.authService.login(user.userName, user._id);
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
        const emailExists = await this.userService.findOneRecord({email});
        if (emailExists) throw new BadRequestException('User already exists with this email.');
        return {message: 'User does not exist with this email'};
    }

    @Post('social-login')
    async socialLogin(@Body() socialLoginDto: SocialLoginDto) {
        const userFound = await this.userService.findOneRecord({email: socialLoginDto.email});

        if (socialLoginDto.userName) {
            const userNameExist = await this.userService.findOne({userName: socialLoginDto.userName});

            if (userNameExist) {
                throw new BadRequestException("username already exist");
                return;
            }
        }


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
            const {access_token} = await this.authService.login(user.userName, user._id);
            return {
                access_token,
                user: {...user.toJSON(), unReadNotifications: 0, unReadMessages: 0, cartItems: 0},
                newUser: true,
            };
        } else {
            //if (userFound.authType !== socialLoginDto.authType) throw new BadRequestException('User already exists with this email.');
            let paymentMethod = null;
            const {access_token} = await this.authService.login(userFound.userName, userFound._id);
            const {unReadMessages, unReadNotifications} = await this.authService.findNotifications(userFound._id);
            const cart = await this.cartService.findOneRecord({creator: userFound._id});
            if (userFound.defaultPaymentMethod) {
                paymentMethod = await this.authService.findOnePaymentMethod(userFound.defaultPaymentMethod);
            }
            return {
                access_token,
                user: {
                    ...userFound.toJSON(),
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
        const userFound = await this.userService.findOneRecord({email});
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
            from: process.env.SENDER_EMAIL,
            text: 'Hello World from NestJS Sendgrid',
            html: `<h1>password reset otp</h1> <br/> ${otp.otp} </br> This otp will expires in 5 minuutes`,
        };
        try{
            await this.emailService.send(mail);
            return {message: 'Otp sent to your email.'};
        }catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() {password, otp}: ResetPasswordDto) {
        const otpFound: OtpDocument = await this.authService.findOneOtp({otp});
        if (!otpFound) throw new BadRequestException('Invalid Otp.');
        const diff = otpFound.expireIn - new Date().getTime();
        if (diff < 0) throw new BadRequestException('Otp expired.');
        await this.userService.findOneRecordAndUpdate({email: otpFound.email}, {password: await hash(password, 10)});
        return {message: 'Password changed successfully.'};
    }




    async validateFacebookAccessToken (accessToken) {
        try {

            const APP_ID = process.env.FACEBOOK_APP_ID;
            const APP_SECRET = process.env.FACEBOOK_APP_SECRET;


            const appAccessToken = `${APP_ID}|${APP_SECRET}`;
            const url = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appAccessToken}`;

            const response = await axios.get(url);
            const data = response.data.data;

            if (data.is_valid && data.app_id === APP_ID) {
                console.log('✅ Token is valid:', data);
                return data;
            } else {
                return null;
            }
        } catch (err) {
            console.error(err.message);
            return null;
        }
    }


    async  validateFacebookTokenJose(idToken) {
        try {

            const FACEBOOK_ISSUER = 'https://www.facebook.com';
            const FACEBOOK_JWKS_URI = 'https://www.facebook.com/.well-known/oauth/openid/jwks/';
            const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_APP_ID; // Replace with your app ID


            // Create Remote JWK Set
            const JWKS = createRemoteJWKSet(new URL(FACEBOOK_JWKS_URI));

            // Verify Token
            const { payload } = await jwtVerify(idToken, JWKS, {
                issuer: FACEBOOK_ISSUER,
                audience: FACEBOOK_CLIENT_ID,
            });

            console.log('✅ Token is valid:', payload);
            return payload;
        } catch (err) {
            console.error('❌ Invalid Token:', err.message);
            return null;
        }
    }


    async handleSocialLogin(decoded:any,type,parsedFirstName,parsedLastName){

        if (!decoded ||  !decoded.email) {
            throw new NotFoundException('Invalid token.');
            return;
        }


        const firstName=parsedFirstName || (decoded.email).split("@")[0].replace(/[^a-z]/gi, '')
        const lastName= parsedLastName || (decoded.email).split("@")[0].replace(/[^0-9]/g, '')
        const userName=(decoded.email).split("@")[0];





            const userFound: any = await this.userService.findOneRecord({email: decoded.email});


            if (userFound) {


                if(userFound.authType!==type){
                    throw new BadRequestException("Account is already created with this email");
                }



                let paymentMethod = null;
                await this.userService.findOneRecordAndUpdate({_id:userFound._id},{authType: type});
                const updatedUser: any = await this.userService.findOneRecord({email: decoded.email});

                const {access_token} = await this.authService.login(userFound.userName, userFound._id);
                const {unReadMessages, unReadNotifications} = await this.authService.findNotifications(userFound._id);
                const cart = await this.cartService.findOneRecord({creator: userFound._id});
                if (userFound.defaultPaymentMethod) {
                    paymentMethod = await this.authService.findOnePaymentMethod(userFound.defaultPaymentMethod);
                }
                return {
                    access_token,
                    user: {
                        ...updatedUser.toJSON(),
                        unReadNotifications,
                        unReadMessages,
                        defaultPaymentMethod: paymentMethod,
                        cartItems: cart?.items?.length || 0,
                    },
                    newUser: false,
                };
            } else {


                const customerAccount = await
                    this.userService.createCustomerAccount(decoded.email, `${firstName} ${lastName}`);

                const user: UserDocument = await this.userService.createRecord({
                    email: decoded.email,
                    firstName,
                    lastName,
                    password: await hash(`${new Date().getTime()}`, 10),
                    authType: type,
                    customerId: customerAccount.id,
                });

                const {access_token} = await this.authService.login(user.email, user._id);
                return {
                    access_token,
                    user: {...user.toJSON(), unReadNotifications: 0, unReadMessages: 0, cartItems: 0},
                    newUser: true,
                };
            }

    }


    @Post('apple')
    async loginApple(@Body() payload: LoginWithSocialDto) {

        try {
            const decoded = await verifyAppleToken({
                idToken: payload.token,
                clientId: process.env.APPLE_CLIENT_ID, // or ["app1ClientId", "app2ClientId"]
                //nonce: "nonce", // optional
            });


            return await this.handleSocialLogin(decoded,AuthTypes.APPLE,null,null)

        } catch (e) {
            throw new BadRequestException(e.message)
        }



    }



    @Post('google')
    async loginGoogle(@Body() payload: LoginWithSocialDto) {

        try {
            const response: any = await axios.get(`${process.env.BASE_URL_GOOGLE_AUTH}${payload.token}`);
            const decoded=response.data;

            return await this.handleSocialLogin(decoded,AuthTypes.GOOGLE,decoded.given_name,decoded.family_name)

        } catch (e) {
            throw new BadRequestException(e.message)
        }

    }


    @Post('facebook')
    async loginFacebook(@Body() payload: LoginWithSocialDto) {

        try {
            const response: any = await axios.get(`${process.env.FACEBOOK_AUTH_URL}access_token=${payload.token}&debug=all&fields=id%2Cname%2Cemail%2Cfirst_name%2Clast_name
            &format=json&method=get&pretty=0&suppress_http_code=1`);
            const decoded=response.data;


            const validateFacebookAccessToken=await this.validateFacebookTokenJose(payload.token)


            if(!validateFacebookAccessToken && !decoded.email)
                throw new BadRequestException("invalid token")


            return await this.handleSocialLogin(validateFacebookAccessToken || decoded,AuthTypes.FACEBOOK,validateFacebookAccessToken.given_name ,
                validateFacebookAccessToken.family_name)

        } catch (e) {
            throw new BadRequestException(e.message)
        }

    }


}
