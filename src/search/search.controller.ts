import { Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { ProductService } from 'src/product/product.service';
import { GroupService } from 'src/group/group.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDocument } from 'src/users/users.schema';
import { GroupDocument } from 'src/group/group.schema';
import { ProductDocument } from 'src/product/product.schema';
import mongoose from 'mongoose';
import { GetUser } from 'src/helpers';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
    private readonly productService: ProductService,
    private readonly groupService: GroupService,
    private readonly userService: UsersService
  ) {}

  @Get()
  async search(
    @Query('query', new DefaultValuePipe('')) query: string,
    @Query('filter', new DefaultValuePipe('all')) filter: string,
    @Query('category') category: string,
    @Query('sort', new DefaultValuePipe('createdAt')) sort: string,
    @GetUser() user: UserDocument
  ) {
    let users: UserDocument[] = [];
    let groups: GroupDocument[] = [];
    let products: ProductDocument[] = [];
    const ObjectId = mongoose.Types.ObjectId;
    const rjx = { $regex: query, $options: 'i' };
    if (filter === 'all') {
      users = await this.userService.findAllRecords(
        {
          $or: [{ firstName: rjx }, { lastName: rjx }],
          _id: { $ne: user._id },
        },
        this.searchService.getSorting(sort, 'user')
      );

      groups = await this.groupService.findAllRecords(
        {
          name: rjx,
        },
        this.searchService.getSorting(sort, 'group')
      );

      products = await this.productService.findStoreProducts(
        {
          title: rjx,
        },
        this.searchService.getSorting(sort, 'product')
      );

      return { users, groups, products };
    } else if (filter === 'people') {
      return await this.userService.findAllRecords(
        {
          $or: [{ firstName: rjx }, { lastName: rjx }],
          _id: { $ne: user._id },
        },
        this.searchService.getSorting(sort, 'user')
      );
    } else if (filter === 'groups') {
      return await this.groupService.findAllRecords(
        {
          name: rjx,
        },
        this.searchService.getSorting(sort, 'group')
      );
    } else {
      return await this.productService.findAllRecords(
        category
          ? {
              title: rjx,
              category: new ObjectId(category),
            }
          : { title: rjx },
        this.searchService.getSorting(sort, 'product')
      );
    }
  }
}
