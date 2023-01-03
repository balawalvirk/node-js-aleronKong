import { Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
import { SearchService } from './search.service';
import { ProductService } from 'src/product/product.service';
import { GroupService } from 'src/group/group.service';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserDocument } from 'src/users/users.schema';
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
    let users = [];
    let groups = [];
    let products = [];
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
      const totalProducts = products.reduce((n, { data }) => n + data.length, 0);
      return { users, groups, products, total: users.length + groups.length + totalProducts };
    } else if (filter === 'people') {
      users = await this.userService.findAllRecords(
        {
          $or: [{ firstName: rjx }, { lastName: rjx }],
          _id: { $ne: user._id },
        },
        this.searchService.getSorting(sort, 'user')
      );
      return { users, groups, products, total: users.length };
    } else if (filter === 'groups') {
      groups = await this.groupService.findAllRecords(
        {
          name: rjx,
        },
        this.searchService.getSorting(sort, 'group')
      );
      return { users, groups, products, total: groups.length };
    } else {
      if (category) {
        products = await this.productService.findAllRecords(
          {
            title: rjx,
            category: new ObjectId(category),
          },
          this.searchService.getSorting(sort, 'product')
        );
      } else {
        products = await this.productService.findAllRecords(
          { title: rjx },
          this.searchService.getSorting(sort, 'product')
        );
      }
      return { users, groups, products, total: products.length };
    }
  }
}
