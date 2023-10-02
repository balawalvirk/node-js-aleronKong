"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePostDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_posts_1 = require("./create-posts");
class UpdatePostDto extends (0, mapped_types_1.PartialType)(create_posts_1.CreatePostsDto) {
}
exports.UpdatePostDto = UpdatePostDto;
//# sourceMappingURL=update-post.dto.js.map