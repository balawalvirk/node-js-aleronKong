import { ChangePasswordDto } from 'src/auth/dtos/change-pass.dto';
import { StripeService } from 'src/helpers';
import { UserDocument } from 'src/users/users.schema';
import { UpdateUserDto } from './dtos/update-user';
import { UsersService } from './users.service';
export declare class UserController {
    private readonly usersService;
    private readonly stripeService;
    constructor(usersService: UsersService, stripeService: StripeService);
    setupProfile(body: UpdateUserDto, user: UserDocument): Promise<any>;
    changePassword({ newPassword }: ChangePasswordDto, user: UserDocument): Promise<{
        message: string;
    }>;
    createGuildMember(user: UserDocument): Promise<any>;
}
