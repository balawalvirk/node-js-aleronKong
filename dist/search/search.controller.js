"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("../product/product.service");
const group_service_1 = require("../group/group.service");
const users_service_1 = require("../users/users.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const mongoose_1 = require("mongoose");
const helpers_1 = require("../helpers");
const search_query_dto_1 = require("./dto/search.query.dto");
const package_service_1 = require("../package/package.service");
let SearchController = class SearchController {
    constructor(productService, groupService, userService, packageService) {
        this.productService = productService;
        this.groupService = groupService;
        this.userService = userService;
        this.packageService = packageService;
    }
    async search({ sort, query, filter, category }, user) {
        let users = [];
        let groups = [];
        let products = [];
        let packages = [];
        if (sort === 'createdAt' && filter === 'all' && !category && query.length === 0) {
            const products = await this.productService.getSearchProducts();
            return products[0].products;
        }
        const rjx = { $regex: query, $options: 'i' };
        if (filter === 'all') {
            const userSearchCondition = {
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
            };
            users = await this.userService.findAllRecords(userSearchCondition, {
                sort: sort === 'name' ? { firstName: -1, lastName: -1 } : { createdAt: -1 },
                limit: 3,
            });
            const totalUsers = await this.userService.countRecords(userSearchCondition);
            groups = await this.groupService.findAllRecords({ name: rjx }, { sort: sort === 'name' ? { name: -1 } : { createdAt: -1 }, limit: 10 });
            const totalGroups = await this.groupService.countRecords({ name: rjx });
            products = await this.productService.findStoreProducts({
                title: rjx,
            }, { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 }, limit: 10 });
            const totalProducts = products.length > 0 ? products.reduce((n, { count }) => n + count, 0) : 0;
            packages = await this.packageService.findAllRecords({ isGuildPackage: true, title: rjx }, { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 }, limit: 10 });
            const totalPackages = await this.packageService.countRecords({ title: rjx, isGuildPackage: true });
            return {
                users: this.userService.getMutalFriends(users, user),
                groups,
                products,
                total: totalUsers + totalGroups + totalProducts + totalPackages,
                totalUsers,
                totalGroups,
                totalProducts,
                packages,
                totalPackages,
            };
        }
        else if (filter === 'people') {
            users = await this.userService.findAllRecords({
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
            }, { sort: sort === 'name' ? { firstName: -1, lastName: -1 } : { createdAt: -1 } });
            return { users: this.userService.getMutalFriends(users, user), groups, products, total: users.length, packages };
        }
        else if (filter === 'groups') {
            groups = await this.groupService.findAllRecords({ name: rjx }, { sort: sort === 'name' ? { name: -1 } : { createdAt: -1 } });
            return { users: this.userService.getMutalFriends(users, user), groups, products, total: groups.length, packages };
        }
        else if (filter === 'guildPackages') {
            packages = await this.packageService.findAllRecords({ title: rjx }, { sort: sort === 'name' ? { name: -1 } : { createdAt: -1 } });
            return { users, groups, products, total: packages.length, packages };
        }
        else {
            if (category) {
                const ObjectId = mongoose_1.default.Types.ObjectId;
                products = await this.productService.findAllRecords({
                    title: rjx,
                    category: new ObjectId(category),
                }, { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 } });
            }
            else {
                products = await this.productService.findAllRecords({ title: rjx }, { sort: sort === 'name' ? { title: -1 } : { createdAt: -1 } });
            }
            return { users: this.userService.getMutalFriends(users, user), groups, products, total: products.length, packages };
        }
    }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_query_dto_1.SearchQueryDto, Object]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
SearchController = __decorate([
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        group_service_1.GroupService,
        users_service_1.UsersService,
        package_service_1.PackageService])
], SearchController);
exports.SearchController = SearchController;
//# sourceMappingURL=search.controller.js.map