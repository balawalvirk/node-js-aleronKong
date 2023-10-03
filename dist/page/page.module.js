"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageModule = void 0;
const common_1 = require("@nestjs/common");
const page_service_1 = require("./page.service");
const page_controller_1 = require("./page.controller");
const mongoose_1 = require("@nestjs/mongoose");
const page_schema_1 = require("./page.schema");
const posts_module_1 = require("../posts/posts.module");
const invitation_schema_1 = require("./invitation.schema");
const invitation_service_1 = require("./invitation.service");
const notification_module_1 = require("../notification/notification.module");
const firebase_module_1 = require("../firebase/firebase.module");
const moderator_schema_1 = require("./moderator.schema");
const moderator_service_1 = require("./moderator.service");
const users_service_1 = require("../users/users.service");
const users_schema_1 = require("../users/users.schema");
const helpers_1 = require("../helpers");
const comment_schema_1 = require("./comment.schema");
const reaction_schema_1 = require("./reaction.schema");
const reaction_service_1 = require("./reaction.service");
const comment_service_1 = require("./comment.service");
let PageModule = class PageModule {
};
PageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: page_schema_1.Page.name, schema: page_schema_1.PageSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: invitation_schema_1.PageInvitation.name, schema: invitation_schema_1.PageInvitationSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: moderator_schema_1.PageModerator.name, schema: moderator_schema_1.PageModeratorSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: users_schema_1.User.name, schema: users_schema_1.UserSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: comment_schema_1.PageComment.name, schema: comment_schema_1.PageCommentSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: reaction_schema_1.PageReaction.name, schema: reaction_schema_1.PageReactionSchema }]),
            posts_module_1.PostsModule,
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
        ],
        controllers: [page_controller_1.PageController],
        providers: [page_service_1.PageService, invitation_service_1.PageInvitationService, moderator_service_1.PageModeratorService, users_service_1.UsersService, helpers_1.StripeService, reaction_service_1.PageReactionService, comment_service_1.PageCommentService,
            helpers_1.SocketGateway],
        exports: [page_service_1.PageService],
    })
], PageModule);
exports.PageModule = PageModule;
//# sourceMappingURL=page.module.js.map