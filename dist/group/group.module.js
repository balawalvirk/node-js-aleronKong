"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupModule = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("./group.service");
const group_controller_1 = require("./group.controller");
const mongoose_1 = require("@nestjs/mongoose");
const group_schema_1 = require("./group.schema");
const posts_module_1 = require("../posts/posts.module");
const fudraising_module_1 = require("../fundraising/fudraising.module");
const notification_module_1 = require("../notification/notification.module");
const firebase_module_1 = require("../firebase/firebase.module");
const moderator_schema_1 = require("./moderator.schema");
const moderator_service_1 = require("./moderator.service");
const mute_module_1 = require("../mute/mute.module");
const invitation_schema_1 = require("./invitation.schema");
const invitation_service_1 = require("./invitation.service");
const report_module_1 = require("../report/report.module");
const page_module_1 = require("../page/page.module");
let GroupModule = class GroupModule {
};
GroupModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: group_schema_1.Group.name, schema: group_schema_1.GroupSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: moderator_schema_1.Moderator.name, schema: moderator_schema_1.ModeratorSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: invitation_schema_1.GroupInvitation.name, schema: invitation_schema_1.GroupInvitationSchema }]),
            (0, common_1.forwardRef)(() => posts_module_1.PostsModule),
            fudraising_module_1.FundraisingModule,
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
            mute_module_1.MuteModule,
            report_module_1.ReportModule,
            page_module_1.PageModule,
        ],
        controllers: [group_controller_1.GroupController],
        providers: [group_service_1.GroupService, moderator_service_1.ModeratorService, invitation_service_1.GroupInvitationService],
        exports: [group_service_1.GroupService, moderator_service_1.ModeratorService],
    })
], GroupModule);
exports.GroupModule = GroupModule;
//# sourceMappingURL=group.module.js.map