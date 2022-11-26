"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const common_1 = require("@nestjs/common");
exports.File = (0, common_1.createParamDecorator)((_data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const file = req.incomingFile;
    return file;
});
//# sourceMappingURL=file.decorator.js.map