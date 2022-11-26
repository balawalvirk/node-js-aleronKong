import { Model } from 'mongoose';
import { BaseService } from 'src/helpers/services/base.service';
import { UserDocument } from 'src/users/users.schema';
export declare class UsersService extends BaseService {
    private userModal;
    constructor(userModal: Model<UserDocument>);
}
