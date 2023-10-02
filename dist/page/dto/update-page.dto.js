"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePageDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_page_dto_1 = require("./create-page.dto");
class UpdatePageDto extends (0, mapped_types_1.PartialType)(create_page_dto_1.CreatePageDto) {
}
exports.UpdatePageDto = UpdatePageDto;
//# sourceMappingURL=update-page.dto.js.map