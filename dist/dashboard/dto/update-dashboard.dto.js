"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDashboardDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_dashboard_dto_1 = require("./create-dashboard.dto");
class UpdateDashboardDto extends (0, mapped_types_1.PartialType)(create_dashboard_dto_1.CreateDashboardDto) {
}
exports.UpdateDashboardDto = UpdateDashboardDto;
//# sourceMappingURL=update-dashboard.dto.js.map