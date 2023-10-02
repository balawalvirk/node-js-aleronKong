"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBroadcastDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_broadcast_dto_1 = require("./create-broadcast.dto");
class UpdateBroadcastDto extends (0, mapped_types_1.PartialType)(create_broadcast_dto_1.CreateBroadcastDto) {
}
exports.UpdateBroadcastDto = UpdateBroadcastDto;
//# sourceMappingURL=update-broadcast.dto.js.map