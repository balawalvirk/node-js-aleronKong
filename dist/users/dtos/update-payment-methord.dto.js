"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentMethordDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payment_methord_dto_1 = require("../../payment/dto/create-payment-methord.dto");
class UpdatePaymentMethordDto extends (0, mapped_types_1.PartialType)(create_payment_methord_dto_1.CreatePaymentMethordDto) {
}
exports.UpdatePaymentMethordDto = UpdatePaymentMethordDto;
//# sourceMappingURL=update-payment-methord.dto.js.map