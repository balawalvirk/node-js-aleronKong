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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const helpers_1 = require("../helpers");
const base_service_1 = require("../helpers/services/base.service");
const users_schema_1 = require("./users.schema");
let UsersService = class UsersService extends base_service_1.BaseService {
    constructor(userModal, stripeService) {
        super(userModal);
        this.userModal = userModal;
        this.stripeService = stripeService;
    }
    async findOne(query) {
        return await this.userModal
            .findOne(query)
            .populate([{ path: 'defaultAddress' }, { path: 'supportingPackages' }])
            .lean();
    }
    async createCustomerAccount(email, name) {
        return await this.stripeService.createCustomer({ email, name });
    }
    async searchQuery() {
        return await this.userModal.find({
            $expr: {
                $regexMatch: {
                    input: {
                        $concat: ['$firstName', ' ', '$lastName'],
                    },
                    regex: 'awais',
                    options: 'i',
                },
            },
        });
    }
    getMutalFriends(users, currentUser) {
        const currentUserFriends = currentUser.friends.map((id) => id.toString());
        return users.map((user) => {
            let mutalFriends = 0;
            const stringifyArray = user.friends.map((id) => id.toString());
            stringifyArray.forEach((id) => {
                if (currentUserFriends.includes(id)) {
                    mutalFriends += 1;
                }
            });
            return Object.assign(Object.assign({}, user.toJSON()), { mutalFriends });
        });
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(users_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model, helpers_1.StripeService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map