import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpException,
    HttpStatus,
    Query,
    BadRequestException
} from '@nestjs/common';
import {GetUser, makeQuery, ParseObjectId, StripeService} from 'src/helpers';
import {UserDocument} from 'src/users/users.schema';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {UsersService} from 'src/users/users.service';
import {NotificationType, UserRoles} from 'src/types';
import {FindAllPackagesQueryDto} from './dto/find-all-query.dto';
import {NotificationService} from 'src/notification/notification.service';
import {FirebaseService} from 'src/firebase/firebase.service';
import {GuildService} from "src/guild/guild.service";
import {CreateGuildDto} from "src/guild/dto/create-guild.dto";
import {UpdateGuildDto} from "src/guild/dto/update-guild.dto";

@Controller('guild')
@UseGuards(JwtAuthGuard)
export class GuildController {
    constructor(
        private readonly guildService: GuildService,
        private readonly stripeService: StripeService,
        private readonly userService: UsersService,
        private readonly notificationService: NotificationService,
        private readonly firebaseService: FirebaseService
    ) {
    }

    @Post('create')
    async create(@Body() createPackageDto: CreateGuildDto, @GetUser() user: UserDocument) {
        //check if package is guild package then only admin can create this package.


        return await this.guildService.createRecord({
            ...createPackageDto,
            creator: user._id,
        });
    }

    @Get('/find-all')
    async findAllPackages(@Query() {page, limit, query, ...rest}: FindAllPackagesQueryDto) {
        const $q = makeQuery({page: page, limit: limit});
        const rjx = {$regex: query ? query : '', $options: 'i'};
        const options = {limit: $q.limit, skip: $q.skip, sort: $q.sort};
        const condition = {...rest, title: rjx};
        const total = await this.guildService.countRecords(condition);
        const packages = await this.guildService.findAllRecords(condition, options);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: packages,
        };
        return paginated;
    }

    @Patch('update/:id')
    async update(@Param('id') id: string, @Body() updatePackageDto: UpdateGuildDto, @GetUser() user: UserDocument) {
        const packageFound = await this.guildService.findOneRecord({_id: id});
        //check if package is guild package then only admin can create this package.
        return await this.guildService.findOneRecordAndUpdate({_id: packageFound._id}, {...updatePackageDto});
    }

}
