"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFileDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_file_dto_1 = require("./create-file.dto");
class UpdateFileDto extends (0, mapped_types_1.PartialType)(create_file_dto_1.CreateFileDto) {
}
exports.UpdateFileDto = UpdateFileDto;
//# sourceMappingURL=update-file.dto.js.map