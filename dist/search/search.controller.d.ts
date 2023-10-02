import { ProductService } from 'src/product/product.service';
import { GroupService } from 'src/group/group.service';
import { UsersService } from 'src/users/users.service';
import { UserDocument } from 'src/users/users.schema';
import { SearchQueryDto } from './dto/search.query.dto';
import { PackageService } from 'src/package/package.service';
export declare class SearchController {
    private readonly productService;
    private readonly groupService;
    private readonly userService;
    private readonly packageService;
    constructor(productService: ProductService, groupService: GroupService, userService: UsersService, packageService: PackageService);
    search({ sort, query, filter, category }: SearchQueryDto, user: UserDocument): Promise<any>;
}
