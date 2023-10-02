"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const firebase_module_1 = require("../firebase/firebase.module");
const group_module_1 = require("../group/group.module");
const notification_module_1 = require("../notification/notification.module");
const report_module_1 = require("../report/report.module");
const users_module_1 = require("../users/users.module");
const comment_schema_1 = require("./comment.schema");
const comment_service_1 = require("./comment.service");
const posts_controller_1 = require("./posts.controller");
const posts_schema_1 = require("./posts.schema");
const posts_service_1 = require("./posts.service");
const reaction_schema_1 = require("./reaction.schema");
const reaction_service_1 = require("./reaction.service");
let PostsModule = class PostsModule {
};
PostsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: posts_schema_1.Posts.name, schema: posts_schema_1.PostSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: comment_schema_1.Comment.name, schema: comment_schema_1.CommentSchema }]),
            mongoose_1.MongooseModule.forFeature([{ name: reaction_schema_1.Reaction.name, schema: reaction_schema_1.ReactionSchema }]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            notification_module_1.NotificationModule,
            firebase_module_1.FirebaseModule,
            (0, common_1.forwardRef)(() => group_module_1.GroupModule),
            report_module_1.ReportModule,
        ],
        controllers: [posts_controller_1.PostsController],
        providers: [posts_service_1.PostsService, comment_service_1.CommentService, reaction_service_1.ReactionService],
        exports: [posts_service_1.PostsService],
    })
], PostsModule);
exports.PostsModule = PostsModule;
//# sourceMappingURL=posts.module.js.map