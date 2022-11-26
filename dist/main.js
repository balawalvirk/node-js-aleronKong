"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const helmet_1 = require("@fastify/helmet");
const multipart_1 = require("@fastify/multipart");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter());
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors();
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    await app.register(helmet_1.default);
    app.register(multipart_1.default);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    await app.listen(port, (_, address) => console.log(`Server is running on ${address}`));
}
bootstrap();
//# sourceMappingURL=main.js.map