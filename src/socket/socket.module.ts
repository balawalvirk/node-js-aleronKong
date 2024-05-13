import {Global, Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {SocketService} from "src/socket/socket.service";
import {SocketGateway} from "src/helpers";

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([

        ]),
    ],
    controllers: [],
    providers: [SocketService,SocketGateway,JwtService],
    exports: [SocketService],

})
export class SocketModule {
}
