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
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const helpers_1 = require("../helpers");
const delete_notification_dto_1 = require("./dto/delete-notification.dto");
const find_all_notifications_query_dto_1 = require("./dto/find-all-notifications.query.dto");
const notification_service_1 = require("./notification.service");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async findAll(user, { page, limit }) {
        const $q = (0, helpers_1.makeQuery)({ page, limit });
        const options = { limit: $q.limit, skip: $q.skip, sort: $q.sort };
        const condition = { receiver: user._id };
        await this.notificationService.updateManyRecords({ receiver: user._id, isRead: false }, { isRead: true });
        const notifications = await this.notificationService.find(condition, options);
        const total = await this.notificationService.countRecords(condition);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: notifications,
        };
        return paginated;
    }
    async delete(deleteNotificationDto) {
        await this.notificationService.deleteManyRecord({ _id: { $in: deleteNotificationDto.notifications } });
        return { message: 'Notifications deleted successfully.' };
    }
    async deleteAll(user) {
        await this.notificationService.deleteManyRecord({ receiver: user._id });
        return { message: 'Notifications deleted successfully.' };
    }
};
__decorate([
    (0, common_1.Get)('find-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, find_all_notifications_query_dto_1.FindAllNotificationsQueryDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)('delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_notification_dto_1.DeleteNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)('delete-all'),
    __param(0, (0, helpers_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteAll", null);
NotificationController = __decorate([
    (0, common_1.Controller)('notification'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map