import {Controller, Get, Query, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ProductService} from 'src/product/product.service';
import {GroupService} from 'src/group/group.service';
import {UsersService} from 'src/users/users.service';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {UserDocument} from 'src/users/users.schema';
import mongoose from 'mongoose';
import {GetUser} from 'src/helpers';
import {SearchQueryDto} from './dto/search.query.dto';
import {PackageService} from 'src/package/package.service';
import {PageService} from "src/page/page.service";

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
    constructor(
        private readonly productService: ProductService,
        private readonly groupService: GroupService,
        private readonly userService: UsersService,
        private readonly packageService: PackageService,
        private readonly pageService: PageService
    ) {
    }

    @Get()
    @UsePipes(new ValidationPipe({transform: true}))
    async search(@Query() {sort, query, filter, category}: SearchQueryDto, @GetUser() user: UserDocument) {
        let users = [];
        let groups = [];
        let products = [];
        let packages = [];
        let pages = [];

        // if nothing is passed then show recommended products
        if (sort === 'createdAt' && filter === 'all' && !category && query.length === 0) {
            const products = await this.productService.getSearchProducts();
            //@ts-ignore
            return products[0].products;
        }
        const rjx = {$regex: query, $options: 'i'};
        if (filter === 'all') {
            const userSearchCondition = {
                $or: [
                    {
                        $expr: {
                            $regexMatch: {
                                input: {$concat: ['$firstName', ' ', '$lastName']},
                                regex: query,
                                options: 'i',
                            },
                        },
                    },
                ],
                _id: {$ne: user._id},
            };
            users = await this.userService.findAllRecords(userSearchCondition, {
                sort: sort === 'name' ? {firstName: -1, lastName: -1} : {createdAt: -1},
                limit: 3,
            });
            const totalUsers = await this.userService.countRecords(userSearchCondition);

            groups = await this.groupService.findAllRecords({name: rjx}, {
                sort: sort === 'name' ? {name: -1} : {createdAt: -1},
                limit: 10
            });
            const totalGroups = await this.groupService.countRecords({name: rjx});

            products = await this.productService.findStoreProducts(
                {
                    title: rjx,
                },
                {sort: sort === 'name' ? {title: -1} : {createdAt: -1}, limit: 10}
            );
            const totalProducts = products.length > 0 ? products.reduce((n, {count}) => n + count, 0) : 0;

            packages = await this.packageService.findAllRecords(
                {isGuildPackage: true, title: rjx},
                {sort: sort === 'name' ? {title: -1} : {createdAt: -1}, limit: 10}
            );

            const totalPackages = await this.packageService.countRecords({title: rjx, isGuildPackage: true});


            pages = await this.pageService.findAllRecords({name: rjx}, {
                sort: sort === 'name' ? {name: -1} : {createdAt: -1},
                limit: 10
            });
            const totalPages = await this.pageService.countRecords({name: rjx});


            return {
                users: this.userService.getMutalFriends(users, user),
                groups,
                products,
                total: totalUsers + totalGroups + totalProducts + totalPackages + totalPages,
                totalUsers,
                totalGroups,
                totalProducts,
                packages,
                totalPackages,
                pages,
                totalPages
            };
        } else if (filter === 'people') {
            users = await this.userService.findAllRecords(
                {
                    $or: [
                        {
                            $expr: {
                                $regexMatch: {
                                    input: {$concat: ['$firstName', ' ', '$lastName']},
                                    regex: query,
                                    options: 'i',
                                },
                            },
                        },
                    ],
                    _id: {$ne: user._id},
                },
                {sort: sort === 'name' ? {firstName: -1, lastName: -1} : {createdAt: -1}}
            );
            return {
                users: this.userService.getMutalFriends(users, user),
                groups,
                products,
                total: users.length,
                packages
            };
        } else if (filter === 'groups') {
            groups = await this.groupService.findAllRecords({name: rjx}, {sort: sort === 'name' ? {name: -1} : {createdAt: -1}});
            return {
                users: this.userService.getMutalFriends(users, user),
                groups,
                products,
                total: groups.length,
                packages
            };
        } else if (filter === 'pages') {
            pages = await this.pageService.findAllRecords({name: rjx}, {sort: sort === 'name' ? {name: -1} : {createdAt: -1}});
            return {
                users: this.userService.getMutalFriends(users, user),
                pages,
                products,
                total: pages.length,
                packages
            };
        } else if (filter === 'guildPackages') {
            packages = await this.packageService.findAllRecords({title: rjx}, {sort: sort === 'name' ? {name: -1} : {createdAt: -1}});
            return {users, groups, products, total: packages.length, packages};
        } else {
            if (category) {
                const ObjectId = mongoose.Types.ObjectId;
                products = await this.productService.findAllRecords(
                    {
                        title: rjx,
                        category: new ObjectId(category),
                    },
                    {sort: sort === 'name' ? {title: -1} : {createdAt: -1}}
                );
            } else {
                products = await this.productService.findAllRecords({title: rjx}, {sort: sort === 'name' ? {title: -1} : {createdAt: -1}});
            }
            return {
                users: this.userService.getMutalFriends(users, user),
                groups,
                products,
                total: products.length,
                packages
            };
        }
    }
}
