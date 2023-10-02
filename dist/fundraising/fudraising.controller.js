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
exports.FundraisingController = void 0;
const common_1 = require("@nestjs/common");
const create_fudraising_dto_1 = require("./dtos/create-fudraising.dto");
const posts_service_1 = require("../posts/posts.service");
const types_1 = require("../types");
const helpers_1 = require("../helpers");
const create_category_1 = require("./dtos/create-category");
const create_subCategory_1 = require("./dtos/create-subCategory");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const role_guard_1 = require("../auth/role.guard");
const category_service_1 = require("./category.service");
const subcategory_service_1 = require("./subcategory.service");
const fundraising_service_1 = require("./fundraising.service");
const fund_project_dto_1 = require("./dtos/fund-project.dto");
const find_all_query_dto_1 = require("./dtos/find-all-query.dto");
const fund_service_1 = require("./fund.service");
const notification_service_1 = require("../notification/notification.service");
const firebase_service_1 = require("../firebase/firebase.service");
let FundraisingController = class FundraisingController {
    constructor(postService, categoryService, subCategoryService, fundraisingService, stripeService, fundService, notificationService, firebaseService) {
        this.postService = postService;
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
        this.fundraisingService = fundraisingService;
        this.stripeService = stripeService;
        this.fundService = fundService;
        this.notificationService = notificationService;
        this.firebaseService = firebaseService;
    }
    async createFundraiser(createFudraisingDto, user) {
        await this.fundraisingService.createRecord(Object.assign(Object.assign({}, createFudraisingDto), { creator: user._id }));
        return { message: 'Your project has been submitted for review.' };
    }
    async fundProject({ amount, projectId }, user) {
        if (!user.defaultPaymentMethod)
            throw new common_1.BadRequestException('User does not have default Payment method');
        const post = await this.postService.findOne({ fundraising: projectId });
        if (!post)
            throw new common_1.HttpException('Fundraising project does not exists.', common_1.HttpStatus.BAD_REQUEST);
        await this.stripeService.createPaymentIntent({
            currency: 'usd',
            payment_method: user.defaultPaymentMethod,
            amount: Math.round(amount * 100),
            customer: user.customerId,
            confirm: true,
            application_fee_amount: Math.round((2 / 100) * amount),
            transfer_data: {
                destination: post.creator.sellerId,
            },
            description: `funding of funraiser project by ${user.firstName} ${user.lastName}`,
        });
        await this.fundService.createRecord({
            project: projectId,
            price: amount,
            donator: user._id,
            beneficiary: post.creator._id,
        });
        const project = await this.fundraisingService.findOneRecordAndUpdate({ _id: projectId }, { $inc: { currentFunding: amount, backers: 1 } });
        post.fundraising.backers = project.backers;
        post.fundraising.currentFunding = project.currentFunding;
        await this.notificationService.createRecord({
            post: post._id,
            sender: user._id,
            receiver: post.creator._id,
            message: `has funded ${amount}$ for your project`,
            type: types_1.NotificationType.FUNDRAISING_PROJECT_FUNDED,
        });
        await this.firebaseService.sendNotification({
            token: post.creator.fcmToken,
            notification: { title: `${post.creator.firstName} ${post.creator.lastName} has funded $${amount} for your project` },
            data: { post: post._id.toString(), type: types_1.NotificationType.FUNDRAISING_PROJECT_FUNDED },
        });
        return post;
    }
    async findAll({ query, page, limit }) {
        const $q = (0, helpers_1.makeQuery)({ page: page, limit: limit });
        const rjx = { $regex: query ? query : '', $options: 'i' };
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const condition = { title: rjx, type: types_1.PostType.FUNDRAISING };
        const total = await this.fundraisingService.countRecords(condition);
        const projects = await this.fundraisingService.findAllRecords(condition, options);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: projects,
        };
        return paginated;
    }
    async approve(id, user) {
        const project = await this.fundraisingService.findOneRecordAndUpdate({ _id: id }, { isApproved: true }).populate('creator');
        const postFound = await this.postService.findOneRecord({ fundraising: project._id });
        if (postFound)
            throw new common_1.HttpException('This project is already approved.', common_1.HttpStatus.BAD_REQUEST);
        const post = await this.postService.createRecord({
            fundraising: project._id,
            creator: project.creator._id,
            type: types_1.PostType.FUNDRAISING,
            status: types_1.PostStatus.ACTIVE,
            privacy: types_1.PostPrivacy.PUBLIC,
        });
        await this.notificationService.createRecord({
            post: post._id,
            sender: user._id,
            receiver: project.creator._id,
            message: `Your fundraising project has been approved`,
            type: types_1.NotificationType.FUNDRAISING_PROJECT_APPROVED,
        });
        if (project.creator.fcmToken) {
            await this.firebaseService.sendNotification({
                token: project.creator.fcmToken,
                notification: { title: `Your fundraising project has been approved` },
                data: { post: post._id.toString(), type: types_1.NotificationType.FUNDRAISING_PROJECT_APPROVED },
            });
        }
        return { message: 'Fundraising project approved successfully.' };
    }
    async createCategory(createFudraisingCategoryDto) {
        return await this.categoryService.createRecord(createFudraisingCategoryDto);
    }
    async findAllCategories() {
        return await this.categoryService.findAllRecords();
    }
    async deleteCategory(id) {
        return await this.categoryService.deleteSingleRecord({ _id: id });
    }
    async createSubCategory(createFudraisingSubCategoryDto) {
        return await this.subCategoryService.createRecord(createFudraisingSubCategoryDto);
    }
    async findAllSubCategories(categoryId) {
        return await this.subCategoryService.findAllRecords({ category: categoryId });
    }
    async deleteSubCategory(id) {
        return await this.subCategoryService.deleteSingleRecord({ _id: id });
    }
};
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fudraising_dto_1.CreateFudraisingDto, Object]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "createFundraiser", null);
__decorate([
    (0, common_1.Post)('fund'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fund_project_dto_1.FundProjectDto, Object]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "fundProject", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Get)('find-all'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [find_all_query_dto_1.FindAllFundraisingQueryDto]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "findAll", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __param(1, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "approve", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Post)('category/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_1.CreateFudraisingCategoryDto]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('category/find-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "findAllCategories", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Delete)('category/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "deleteCategory", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Post)('sub-category/create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subCategory_1.CreateFudraisingSubCategoryDto]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "createSubCategory", null);
__decorate([
    (0, common_1.Get)('sub-category/find-all/:categoryId'),
    __param(0, (0, common_1.Param)('categoryId', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "findAllSubCategories", null);
__decorate([
    (0, helpers_1.Roles)(types_1.UserRoles.ADMIN),
    (0, common_1.Delete)('sub-category/:id/delete'),
    __param(0, (0, common_1.Param)('id', helpers_1.ParseObjectId)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FundraisingController.prototype, "deleteSubCategory", null);
FundraisingController = __decorate([
    (0, common_1.Controller)('fundraising'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, role_guard_1.RolesGuard),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        category_service_1.FudraisingCategoryService,
        subcategory_service_1.FudraisingSubCategoryService,
        fundraising_service_1.FundraisingService,
        helpers_1.StripeService,
        fund_service_1.FundService,
        notification_service_1.NotificationService,
        firebase_service_1.FirebaseService])
], FundraisingController);
exports.FundraisingController = FundraisingController;
//# sourceMappingURL=fudraising.controller.js.map