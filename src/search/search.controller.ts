import { Controller, Get, Query, UseGuards, DefaultValuePipe } from '@nestjs/common';
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
    // if nothing is passed then show recommended products
    if (sort === 'createdAt' && filter === 'all' && !category && query.length === 0) {
      const products = await this.productService.getSearchProducts();
      //@ts-ignore
      return products[0].products;
    }
    const rjx = { $regex: query, $options: 'i' };
    if (filter === 'all') {
      users = await this.userService.findAllRecords(
        {
          $or: [
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$firstName', ' ', '$lastName'] },
                  regex: query,
                  options: 'i',
                },
              },
            },
          ],
          _id: { $ne: user._id },
        },
        { sort: sort === 'name' ? { firstName: -1, lastName: -1 } : { createdAt: -1 }, limit: 3 }
      );
      const totalUsers = await this.userService.countRecords({
        $or: [{ firstName: rjx }, { lastName: rjx }],
        _id: { $ne: user._id },
      });

      groups = await this.groupService.findAllRecords({ name: rjx }, { sort: sort === 'name' ? { name: -1 } : { createdAt: -1 }, limit: 10 });
      const totalGroups = await this.groupService.countRecords({ name: rjx });

      products = await this.productService.findStoreProducts(
        {
          title: rjx,
        },
        { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 }, limit: 10 }
      );
      const totalProducts = products.length > 0 ? products.reduce((n, { count }) => n + count, 0) : 0;
      return {
        users: this.userService.getMutalFriends(users, user),
        groups,
        products,
        total: totalUsers + totalGroups + totalProducts,
        totalUsers,
        totalGroups,
        totalProducts,
      };
    } else if (filter === 'people') {
      users = await this.userService.findAllRecords(
        {
          $or: [
            {
              $expr: {
                $regexMatch: {
                  input: { $concat: ['$firstName', ' ', '$lastName'] },
                  regex: query,
                  options: 'i',
                },
              },
            },
          ],
          _id: { $ne: user._id },
        },
        { sort: sort === 'name' ? { firstName: -1, lastName: -1 } : { createdAt: -1 } }
      );
      return { users: this.userService.getMutalFriends(users, user), groups, products, total: users.length };
    } else if (filter === 'groups') {
      groups = await this.groupService.findAllRecords({ name: rjx }, { sort: sort === 'name' ? { name: -1 } : { createdAt: -1 } });
      return { users: this.userService.getMutalFriends(users, user), groups, products, total: groups.length };
    } else {
      if (category) {
        products = await this.productService.findAllRecords(
          {
            title: rjx,
            category: new ObjectId(category),
          },
          { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 } }
        );
      } else {
        products = await this.productService.findAllRecords({ title: rjx }, { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 } });
      }
      return { users: this.userService.getMutalFriends(users, user), groups, products, total: products.length };
    }
  }
}
