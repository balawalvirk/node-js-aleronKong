import { UserDocument } from 'src/users/users.schema';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressController {
    private readonly addressService;
    constructor(addressService: AddressService);
    createAddress(createAddressDto: CreateAddressDto, user: UserDocument): Promise<any>;
    findAllAddress(user: UserDocument): Promise<any[]>;
    deleteAddress(id: string): Promise<any>;
    updateAddress(id: string, updateAddressDto: UpdateAddressDto): Promise<any>;
}
