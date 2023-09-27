import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Put,
    BadRequestException,
    Query,
    UsePipes,
    ValidationPipe,
    Delete,
    ParseBoolPipe, HttpException, HttpStatus, UnauthorizedException, ForbiddenException
} from '@nestjs/common';
import {PageService} from './page.service';
import {CreatePageDto} from './dto/create-page.dto';
import {UpdatePageDto} from './dto/update-page.dto';
import {GetUser, makeQuery, PaginationDto, ParseObjectId} from 'src/helpers';
import {User, UserDocument} from 'src/users/users.schema';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {PostsService} from 'src/posts/posts.service';
import {FindAllPagesQueryDto} from './dto/find-all-pages.query.dto';
import {NotificationType, PageFilter} from 'src/types';
import {GroupInvitationService} from "src/group/invitation.service";
import {PageInvitationService} from "src/page/invitation.service";
import {NotificationService} from "src/notification/notification.service";
import {FirebaseService} from "src/firebase/firebase.service";
import {CreateInvitationDto} from "src/page/dto/create-invitation.dto";
import {CreateModeratorDto} from "src/group/dto/create-moderator.dto";
import {UpdateModeratorDto} from "src/group/dto/update-moderator.dto";
import {ModeratorService} from "src/group/moderator.service";
import {PageModeratorService} from "src/page/moderator.service";
import {CreatePageModeratorDto} from "src/page/dto/create-page-moderator.dto";
import {UpdatePageModeratorDto} from "src/page/dto/update-page-moderator.dto";

@Controller('page')
@UseGuards(JwtAuthGuard)
export class PageController {
    constructor(
        private readonly pageService: PageService,
        private readonly postService: PostsService,
        private readonly invitationService: PageInvitationService,
        private readonly notificationService: NotificationService,
        private readonly firebaseService: FirebaseService,
        private readonly moderatorService: PageModeratorService,

    ) {
    }

    @Post('create')
    async create(@Body() createPageDto: CreatePageDto, @GetUser() user: UserDocument) {
        return await this.pageService.createRecord({...createPageDto, creator: user._id});
    }

    @Get(':id/find-one')
    async findOne(@Param('id', ParseObjectId) id: string) {
        return await this.pageService.findOneRecord({_id: id});
    }

    @Put(':id/update')
    async update(@Param('id', ParseObjectId) id: string, @Body() updatePageDto: UpdatePageDto) {
        return await this.pageService.findOneRecordAndUpdate({_id: id}, updatePageDto);
    }

    @Get('find-all')
    @UsePipes(new ValidationPipe({transform: true}))
    async findAll(@Query() {filter, query, limit, page}: FindAllPagesQueryDto, @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, sort: $q.sort};
        if (filter === PageFilter.ALL) {
            const condition = {name: {$regex: query, $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }

        if (filter === PageFilter.POPULAR) {
            const condition = {name: {$regex: query, $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }

        if (filter === PageFilter.LATEST) {
            const condition = {name: {$regex: query, $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }

        if (filter === PageFilter.SUGGESTED) {
            const condition = {name: {$regex: query, $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            const pages = await this.pageService.findAllRecords(condition, options);
            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }
    }

    //find pages of a specific user
    @Get('find-all/user/:id')
    async findUserPages(@Param('id', ParseObjectId) id: string, @Query() {page, limit}: PaginationDto) {
        const $q = makeQuery({page, limit});
        const condition = {creator: id};
        const options = {sort: $q.sort, limit: $q.limit, skip: $q.skip};
        const total = await this.pageService.countRecords(condition);
        const pages = await this.pageService.findAllRecords(condition, options);
        const paginated = {
            total,
            pages: Math.round(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: pages,
        };
        return paginated;
    }

    @Put(':id/follow')
    async follow(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const page = await this.pageService.findOneRecord({_id: id});
        if (!page) throw new BadRequestException('Page does not exists.');

        //check if user is already a follower of this page
        //@ts-ignore
        const followerFound = page.followers.find((follower) => follower.follower.equals(user._id));
        if (followerFound) throw new BadRequestException('You are already a follower of this page.');
        return await this.pageService.findOneRecordAndUpdate({_id: id}, {$push: {followers: {follower: user._id}}});
    }

    @Put(':id/un-follow')
    async unFollow(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
        return await this.pageService.findOneRecordAndUpdate({_id: id}, {$pull: {followers: {follower: user._id}}});
    }

    @Get('follow/find-all')
    async findAllfollowedPages(@GetUser() user: UserDocument) {
        return await this.pageService.findAllRecords({'followers.follower': user._id}).populate('creator');
    }

    // find all post of page that user follow
    @Get('follow/post/find-all')
    async feed(@GetUser() user: UserDocument, @Query() {page, limit}: PaginationDto) {
        const $q = makeQuery({page, limit});
        const options = {sort: {pin: -1, ...$q.sort}, limit: $q.limit, skip: $q.skip};
        const pages = (await this.pageService.findAllRecords({'followers.follower': user._id})).map((follower) => follower._id);
        const condition = {page: {$in: pages}, creator: {$nin: user.blockedUsers}};
        const posts = await this.postService.find(condition, options);
        const total = await this.postService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.floor(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }

    @Get(':id/follower/find-all')
    async findAllFollowers(@Param('id', ParseObjectId) id: string) {
        return await this.pageService.findAllFollowers({_id: id});
    }

    // find posts of specfic page
    @Get(':id/post/find-all')
    async findPostsOfPage(@Param('id', ParseObjectId) id: string, @Query() {limit, page}: PaginationDto, @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});
        const options = {sort: {feature: -1, pin: -1, ...$q.sort}, limit: $q.limit, skip: $q.skip};
        const condition = {page: id, creator: {$nin: user.blockedUsers}};
        const posts = await this.postService.find(condition, options);
        const total = await this.postService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }

    @Delete(':id/delete')
    async remove(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const page = await this.pageService.findOneRecord({_id: id});
        if (!page) throw new BadRequestException('Page does not exist.');
        if (page.creator.toString() != user._id) throw new BadRequestException('You cannot delete this page.');
        await this.pageService.deleteSingleRecord({_id: page._id});
        await this.postService.deleteManyRecord({page: page._id});
        return page;
    }


    @Post('moderator/create')
    async createModerator(@Body() createModeratorDto: CreatePageModeratorDto, @GetUser() user: UserDocument) {
        const page = await this.pageService.findOneRecord({_id: createModeratorDto.page});
        if (!page) throw new HttpException('Page does not exists.', HttpStatus.BAD_REQUEST);

        // check if user is already a moderator in this group
        // @ts-ignore
        if (page.moderators.includes(createModeratorDto.user)) throw new BadRequestException('This moderator already exists in this page.');
        if (page.creator.toString() != user._id) throw new UnauthorizedException();
        const moderator = await this.moderatorService.create(createModeratorDto);
        await this.pageService.findOneRecordAndUpdate({_id: createModeratorDto.page}, {$push: {moderators: moderator._id}});
        return moderator;
    }

    // find all moderators of specfic group
    @Get(':id/moderator/find-all')
    async findAllModerator(@Param('id', ParseObjectId) id: string) {
        return await this.moderatorService.find({page: id});
    }

    @Delete('moderator/:id/delete')
    async deleteModerator(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const moderator = await this.moderatorService.findOneRecord({_id: id}).populate('page');
        if (!moderator) throw new HttpException('Moderator does not exists.', HttpStatus.BAD_REQUEST);
        if (moderator.user.toString() == user._id || moderator.page.creator.toString() == user._id) {
            await this.moderatorService.deleteSingleRecord({_id: id});
            await this.pageService.findOneRecordAndUpdate({_id: moderator.page}, {$pull: {moderators: moderator._id}});
            return moderator;
        } else throw new ForbiddenException();
    }

    @Put('moderator/:id/update')
    async updateModerator(@Param('id', ParseObjectId) id: string, @Body() updateModeratorDto: UpdatePageModeratorDto, @GetUser() user: UserDocument) {
        const moderator = await this.moderatorService.findOneRecord({_id: id}).populate('page');
        if (!moderator) throw new BadRequestException('Moderator does not exists.');
        if (moderator.user.toString() == user._id || moderator.page.creator.toString() == user._id)
            return await this.moderatorService.findOneRecordAndUpdate({_id: id}, updateModeratorDto).populate('user');
        else throw new ForbiddenException();
    }


    @Post('invitation/create')
    async createInvitation(@Body() {friend, page}: CreateInvitationDto, @GetUser() user: UserDocument) {
        const invitationFound = await this.invitationService.findOneRecord({user: user._id, page, friend});
        if (invitationFound) throw new BadRequestException('Page invitation request already exists.');
        const invitation = await this.invitationService.create({user: user._id, page, friend});

        console.log()

        await this.notificationService.createRecord({
            type: NotificationType.PAGE_INVITATION,
            //@ts-ignore
            page: invitation.page._id,
            message: `has sent you a page invitation request.`,
            sender: user._id,
            //@ts-ignore
            receiver: invitation.friend._id,
            invitation:invitation._id
        });

        await this.firebaseService.sendNotification({
            token: invitation.friend.fcmToken,
            notification: {title: `${user.firstName} ${user.lastName} has sent you a group invitation request.`},
            //@ts-ignore
            data: {page: invitation.page._id.toString(), type: NotificationType.PAGE_INVITATION,
                invitation:(invitation._id).toString()},
        });

        return invitation;
    }

    @Get('invitation/find-all')
    async findAllInvitations(@GetUser() user: UserDocument) {
        return await this.invitationService.find({friend: user._id});
    }

    @Put('invitation/:id/accept-reject')
    async acceptRejectInvitations(
        @Body('isApproved', new ParseBoolPipe()) isApproved: boolean,
        @Param('id', ParseObjectId) id: string,
        @GetUser() user: UserDocument
    ) {
        const invitation = await this.invitationService.findOne({_id: id});
        if (!invitation) throw new BadRequestException('Page invitation does not exists.');
        await this.invitationService.deleteSingleRecord({_id: id});

        if (isApproved) {
            await this.notificationService.createRecord({
                type: NotificationType.PAGE_JOIN_REQUEST,
                // @ts-ignore
                page: invitation.page._id,
                message: `has sent a join request for ${invitation.page.name} page`,
                sender: user._id,
                //@ts-ignore
                receiver: invitation.user,
                invitation:invitation._id
            });
            //@ts-ignore

            await this.firebaseService.sendNotification({
                token: invitation.page.creator.fcmToken,
                notification: {title: `${user.firstName} ${user.lastName} has sent a join request for ${invitation.page.name} page`},
                // @ts-ignore
                data: {page: invitation.page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST,
                    invitation:invitation._id.toString()},
            });
            await this.pageService.findOneRecordAndUpdate({_id: invitation.page}, {$push: {requests: user._id}});
        }
        return invitation;
    }



    @Put('request/:id/:userId')
    async approveRejectRequest(
        @Query('isApproved', new ParseBoolPipe()) isApproved: boolean,
        @Param('id', ParseObjectId) id: string,
        @Param('userId', ParseObjectId) userId: string,
        @GetUser() user: UserDocument
    ) {
        const page = await this.pageService.findOneRecord({ _id: id });
        if (!page) throw new HttpException('Page does not exist.', HttpStatus.BAD_REQUEST);

        if (page.creator.toString() == user._id) {
            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is approved`,
                    type: NotificationType.PAGE_JOIN_REQUEST_APPROVED,
                });

                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join group is approved` },
                        data: { page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_APPROVED },
                    });
                }
                return 'Request approved successfully.';
            } else {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });

                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join group is rejected`,
                    type: NotificationType.PAGE_JOIN_REQUEST_REJECTED,
                });

                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join group is rejected` },
                        data: { page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_REJECTED },
                    });
                }

                return 'Request rejected successfully.';
            }
        } else {
            const moderator = await this.moderatorService.findOneRecord({ group: id, user: user._id });
            if (!moderator) throw new UnauthorizedException();

            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId }, $push: { members: { member: userId } } });

                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is approved`,
                    type: NotificationType.PAGE_JOIN_REQUEST_APPROVED,
                });

                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join page is approved` },
                        data: { page: page._id.toString(), type: NotificationType.GROUP_JOIN_REQUEST_APPROVED },
                    });
                }

                return 'Request approved successfully.';
            } else {
                await this.pageService.findOneRecordAndUpdate({ _id: id }, { $pull: { requests: userId } });
                await this.notificationService.createRecord({
                    page: page._id,
                    sender: user._id,
                    receiver: userId,
                    message: `Your request to join page is rejected`,
                    type: NotificationType.PAGE_JOIN_REQUEST_REJECTED,
                });

                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: { title: `Your request to join group is rejected` },
                        data: { page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_REJECTED },
                    });
                }

                return 'Request rejected successfully.';
            }
        }
    }

}
