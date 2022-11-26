"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSocialDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_social_dto_1 = require("./create-social.dto");
class UpdateSocialDto extends (0, mapped_types_1.PartialType)(create_social_dto_1.CreateSocialDto) {
}
exports.UpdateSocialDto = UpdateSocialDto;
//# sourceMappingURL=update-social.dto.js.map