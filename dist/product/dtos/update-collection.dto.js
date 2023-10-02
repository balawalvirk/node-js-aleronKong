"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCollectionDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_collection_dto_1 = require("./create-collection.dto");
class UpdateCollectionDto extends (0, mapped_types_1.PartialType)(create_collection_dto_1.CreateCollectionDto) {
}
exports.UpdateCollectionDto = UpdateCollectionDto;
//# sourceMappingURL=update-collection.dto.js.map