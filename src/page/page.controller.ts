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
import {GetUser, makeQuery, PaginationDto, ParseObjectId, SocketGateway} from 'src/helpers';
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
import {UsersService} from "src/users/users.service";
import {CreateCommentDto} from "src/posts/dtos/create-comment";
import {FindAllCommentQueryDto} from "src/posts/dtos/find-all-comments.query.dto";
import {UpdateCommentDto} from "src/posts/dtos/update-comment.dto";
import {PageReactionService} from "src/page/reaction.service";
import {PageCommentService} from "src/page/comment.service";
import {AddReactionsDto} from "src/posts/dtos/add-reactions.dto";
import {UpdateReactionsDto} from "src/posts/dtos/update-reaction.dto";
import {UpdatePageCommentDto} from "src/page/dto/update-comment.dto";

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
        private readonly usersService: UsersService,
        private readonly commentService: PageCommentService,
        private readonly reactionService: PageReactionService,
        private readonly socketService: SocketGateway,
    ) {
    }

    @Post('create')
    async create(@Body() createPageDto: CreatePageDto, @GetUser() user: UserDocument) {
        return await this.pageService.createRecord({...createPageDto, creator: user._id});
    }


    @Put('comment/update')
    async updateComment(@Body() {commentId, pageId, ...rest}: UpdatePageCommentDto) {
        return await this.commentService.update({_id: commentId}, rest);
    }


    @Get(':id/find-one')
    async findOne(@Param('id', ParseObjectId) id: string) {
        const page: any = await this.pageService.findOneRecord({_id: id})
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();


        return page;

    }

    @Put(':id/update')
    async update(@Param('id', ParseObjectId) id: string, @Body() updatePageDto: UpdatePageDto) {
        const updated: any = await this.pageService.findOneRecordAndUpdate({_id: id}, updatePageDto)
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .populate("followers.follower", "firstName lastName avatar")
            .populate("followers.page")
            .lean();

        return updated;

    }

    @Get('/find-all')
    @UsePipes(new ValidationPipe({transform: true}))
    async findAll(@Query() {filter, query, limit, page, created, moderating, following, pageId}: any, @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, sort: $q.sort};

        let multipleQuery = [];
        query = query || "";
        if (created) {
            multipleQuery.push({creator: user._id});
        }


        if (moderating) {
            multipleQuery.push({'moderators.user': {$in: [user._id]}});
        }

        if (following) {

            if (pageId) {
                multipleQuery.push({'followers.page': {$in: [pageId]}});
            } else {
                multipleQuery.push({'followers.follower': {$in: [user._id]}});
            }
        }


        if (filter === PageFilter.ALL || filter === PageFilter.FOR_YOU) {
            const condition = {name: {$regex: query || "", $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            let pages = await this.pageService.findAllRecords(condition, options)
                .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
                .lean();


            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }

        if (filter === PageFilter.POPULAR) {
            const condition = {name: {$regex: query || "", $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            let pages = await this.pageService.findAllRecords(condition, options)
                .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
                .lean();


            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }

        if (filter === PageFilter.LATEST) {
            const condition = {name: {$regex: query || "", $options: 'i'}, creator: {$ne: user._id}};
            const total = await this.pageService.countRecords(condition);
            let pages = await this.pageService.findAllRecords(condition, options)
                .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
                .lean();

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
            let pages = await this.pageService.findAllRecords(condition, options)
                .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
                .lean();


            return {
                total,
                pages: Math.floor(total / $q.limit),
                page: $q.page,
                limit: $q.limit,
                data: pages,
            };
        }


        if (multipleQuery.length > 0) {
            const condition = {$or: multipleQuery};
            const total = await this.pageService.countRecords(condition);
            let pages = await this.pageService.findAllRecords(condition, options)
                .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
                .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
                .lean();


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
        let pages = await this.pageService.findAllRecords(condition, options)
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();


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
        const page = await this.pageService.findOneRecord({_id: id})
            .populate("creator")
        if (!page) throw new BadRequestException('Page does not exists.');

        //check if user is already a follower of this page
        //@ts-ignore
        const followerFound = page.followers.find((follower) => follower.follower && (follower.follower).equals(user._id));
        if (followerFound) throw new BadRequestException('You are already a follower of this page.');


        await this.notificationService.createRecord({
            type: NotificationType.PAGE_FOLLOW_ACCEPTED,
            // @ts-ignore
            page: id,
            message: `${user.firstName} ${user.lastName} has started following the ${page.name} page`,
            sender: user._id,
            //@ts-ignore
            receiver: page.creator._id
        });
        //@ts-ignore

        await this.firebaseService.sendNotification({
            token: page.creator.fcmToken,
            notification: {title: `${user.firstName} ${user.lastName} has started following the ${page.name} page`},
            // @ts-ignore
            data: {page: id.toString(), type: NotificationType.PAGE_FOLLOW_ACCEPTED},
        });

        const updated: any = await this.pageService.findOneRecordAndUpdate({_id: id}, {$push: {followers: {follower: user._id}}})
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();


        return updated;

    }


    @Put(':id/followerPage/:followerPage/follow')
    async followPage(@Param('id', ParseObjectId) id: string, @Param('followerPage', ParseObjectId) followerPage: string, @GetUser() user: UserDocument) {
        const page = await this.pageService.findOneRecord({_id: id})
            .populate("creator")
        if (!page) throw new BadRequestException('Page does not exists.');

        //check if user is already a follower of this page
        //@ts-ignore
        const followerFound = page.followers.find((follower) => follower.page && follower.page.equals(followerPage));
        if (followerFound) throw new BadRequestException('You are already a follower of this page.');


        await this.notificationService.createRecord({
            type: NotificationType.PAGE_FOLLOW_ACCEPTED,
            // @ts-ignore
            page: id,
            message: `${user.firstName} ${user.lastName} has started following the ${page.name} page`,
            sender: user._id,
            //@ts-ignore
            receiver: page.creator._id,
        });
        //@ts-ignore

        await this.firebaseService.sendNotification({
            token: page.creator.fcmToken,
            notification: {title: `${user.firstName} ${user.lastName} has started following the ${page.name} page`},
            // @ts-ignore
            data: {page: id.toString(), type: NotificationType.PAGE_FOLLOW_ACCEPTED},
        });

        const updated: any = await this.pageService.findOneRecordAndUpdate({_id: id}, {
            $push:
                {followers: {page: followerPage}}
        })
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();


        return updated;

    }


    @Put(':id/un-follow')
    async unFollow(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string) {
        const updated: any = await this.pageService.findOneRecordAndUpdate({_id: id}, {$pull: {followers: {follower: user._id}}})
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .populate("followers.page")
            .populate("followers.follower", "firstName lastName avatar")
            .lean();


        return updated;
    }


    @Put(':id/page/:page/un-follow')
    async unFollowPage(@GetUser() user: UserDocument, @Param('id', ParseObjectId) id: string,
                       @Param('page', ParseObjectId) unFollowPage: string) {
        const updated: any = await this.pageService.findOneRecordAndUpdate({_id: id}, {
            $pull: {
                followers:
                    {page: unFollowPage}
            }
        })
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .populate("followers.page")
            .populate("followers.follower", "firstName lastName avatar")
            .lean();


        return updated;

    }


    @Get('follow/find-all')
    async findAllfollowedPages(@GetUser() user: UserDocument) {
        let pages: any = await this.pageService.findAllRecords({'followers.follower': user._id}).populate('creator')
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();

        return pages;

    }


    @Get('follow-created/find-all')
    async findAllfollowedPagesAndCreated(@GetUser() user: UserDocument) {
        let pages: any = await this.pageService.findAllRecords({$or: [{'followers.follower': user._id}, {creator: user._id}]})
            .populate('creator')
            .populate({path: 'moderators.user', select: 'firstName lastName avatar'})
            .populate("moderators.moderator", "createPost engageAsPage deletePage editPage")
            .lean();

        return pages;

    }


    // find all post of page that user follow
    @Get('follow/post/find-all')
    async feed(@GetUser() user: UserDocument, @Query() {page, limit,creator}: PaginationDto) {
        const $q = makeQuery({page, limit,});
        const options = {sort: {pin: -1, ...$q.sort}, limit: $q.limit, skip: $q.skip};




        const pagesFollowed = (await this.pageService.findAllRecords({'followers.follower': user._id})).map((page) => page._id);

        let condition:any = {page: {$in: pagesFollowed}, creator: {$nin: user.blockedUsers}};

        if(creator){
            const pagesCreated = (await this.pageService.findAllRecords({'creator': user._id})).map((page) => page._id);

            condition = {page: {$in: pagesFollowed.concat(pagesCreated)},creator: {$nin: user.blockedUsers}};
        }


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
        let page: any = await this.pageService.findAllFollowers({_id: id});


        return page;


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
        const moderator = await this.usersService.findOne({_id: createModeratorDto.user})

        if (!moderator) throw new HttpException('Moderator does not exists.', HttpStatus.BAD_REQUEST);

        if (!page) throw new HttpException('Page does not exists.', HttpStatus.BAD_REQUEST);

        // check if user is already a moderator in this group
        // @ts-ignore

        const findIndex = (page.moderators).findIndex((moderator) => (moderator.user).toString() === createModeratorDto.user)

        if (findIndex !== -1) throw new BadRequestException('This moderator already exists in this page.');
        if (page.creator.toString() != user._id) throw new UnauthorizedException();
        const saveModerator = await this.moderatorService.create(createModeratorDto);
        await this.pageService.findOneRecordAndUpdate({_id: createModeratorDto.page},
            {$push: {moderators: {user: createModeratorDto.user, moderator: saveModerator._id}}});


        await this.notificationService.createRecord({
            type: NotificationType.PAGE_MODERATOR,
            //@ts-ignore
            page: page._id,
            message: `${user.firstName} ${user.lastName} has added you as moderator.`,
            sender: user._id,
            //@ts-ignore
            receiver: createModeratorDto.user
        });

        await this.firebaseService.sendNotification({
            token: moderator.fcmToken,
            notification: {title: `${user.firstName} ${user.lastName} has added you as moderator.`},
            //@ts-ignore
            data: {page: createModeratorDto.page, type: NotificationType.PAGE_MODERATOR},
        });


        return saveModerator;
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
            const page = await this.pageService.findOneRecord({_id: moderator.page});
            const findIndex = (page.moderators).findIndex((m) => (m.moderator).toString() === (moderator._id).toString());

            if (findIndex === -1) {
                throw new HttpException('Moderator does not exists.', HttpStatus.BAD_REQUEST);
            }
            (page.moderators).splice(findIndex, 1);
            await page.save();

            //await this.pageService.findOneRecordAndUpdate({_id: moderator.page}, {$pull: {"moderators.m": moderator._id}});
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
        const invitation: any = await this.invitationService.create({user: user._id, page, friend});


        await this.notificationService.createRecord({
            type: NotificationType.PAGE_INVITATION,
            //@ts-ignore
            page: invitation.page._id,
            message: `has invited you to follow ${invitation.page.name} Page.`,
            sender: user._id,
            //@ts-ignore
            receiver: invitation.friend._id,
            invitation: invitation._id
        });

        await this.firebaseService.sendNotification({
            token: invitation.friend.fcmToken,
            notification: {title: `has sent you a page invitation request.`},
            //@ts-ignore
            data: {
                page: invitation.page._id.toString(), type: NotificationType.PAGE_INVITATION,
                invitation: (invitation._id).toString()
            },
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
        let invitation: any = await this.invitationService.findOne({_id: id});
        if (!invitation) throw new BadRequestException('Page invitation does not exists.');
        await this.invitationService.deleteSingleRecord({_id: id});

        if (isApproved) {
            await this.notificationService.createRecord({
                type: NotificationType.PAGE_FOLLOW_ACCEPTED,
                // @ts-ignore
                page: invitation.page._id,
                message: `${user.firstName} ${user.lastName} has accepted the ${invitation.page.name} page follow request`,
                sender: user._id,
                //@ts-ignore
                receiver: invitation.user._id,
                invitation: invitation._id
            });
            //@ts-ignore

            await this.firebaseService.sendNotification({
                token: invitation.user.fcmToken,
                notification: {title: `${user.firstName} ${user.lastName} has accepted the ${invitation.page.name} page follow request`},
                // @ts-ignore
                data: {
                    page: invitation.page._id.toString(), type: NotificationType.PAGE_FOLLOW_ACCEPTED,
                    invitation: invitation._id.toString()
                },
            });
            const page = await this.pageService.findOneRecordAndUpdate({_id: invitation.page._id}, {
                $pull: {requests: user._id},
                $push: {followers: {follower: user._id}}
            });
            invitation.page = page;
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
        const page = await this.pageService.findOneRecord({_id: id});
        if (!page) throw new HttpException('Page does not exist.', HttpStatus.BAD_REQUEST);

        if (page.creator.toString() == user._id) {
            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({_id: id}, {
                    $pull: {requests: userId},
                    $push: {followers: {follower: userId}}
                });
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
                        notification: {title: `Your request to join page is approved`},
                        data: {page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_APPROVED},
                    });
                }
                return 'Request approved successfully.';
            } else {
                await this.pageService.findOneRecordAndUpdate({_id: id}, {$pull: {requests: userId}});

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
                        notification: {title: `Your request to join page is rejected`},
                        data: {page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_REJECTED},
                    });
                }

                return 'Request rejected successfully.';
            }
        } else {
            const moderator = await this.moderatorService.findOneRecord({group: id, user: user._id});
            if (!moderator) throw new UnauthorizedException();

            if (isApproved) {
                await this.pageService.findOneRecordAndUpdate({_id: id}, {
                    $pull: {requests: userId},
                    $push: {followers: {follower: userId}}
                });

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
                        notification: {title: `Your request to join page is approved`},
                        data: {page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_APPROVED},
                    });
                }

                return 'Request approved successfully.';
            } else {
                await this.pageService.findOneRecordAndUpdate({_id: id}, {$pull: {requests: userId}});
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
                        notification: {title: `Your request to join page is rejected`},
                        data: {page: page._id.toString(), type: NotificationType.PAGE_JOIN_REQUEST_REJECTED},
                    });
                }

                return 'Request rejected successfully.';
            }
        }
    }


    @Post('/:id/comment')
    async createComment(@Param('id') id: string, @GetUser() user: UserDocument, @Body() createCommentDto: CreateCommentDto) {
        const page = await this.pageService.findOneRecord({_id: id}).populate('creator');
        if (!page) throw new BadRequestException('Page does not exists.');
        let comment;
        if (createCommentDto.comment) {
            comment = await this.commentService.create({creator: user._id, post: id, ...createCommentDto});
            const updatedComment: any = await this.commentService
                .findOneRecordAndUpdate({_id: createCommentDto.comment}, {$push: {replies: comment._id}})
                .populate('creator');

            await this.notificationService.createRecord({
                page: page._id,
                message: 'replied to you comment.',
                type: NotificationType.COMMENT_REPLIED,
                sender: user._id,
                //@ts-ignore
                receiver: updatedComment.creator._id,
            });

            await this.firebaseService.sendNotification({
                token: updatedComment.creator.fcmToken,
                notification: {title: `${user.firstName} ${user.lastName} replied to you comment.`},
                data: {page: page._id.toString(), type: NotificationType.COMMENT_REPLIED},
            });

            this.socketService.triggerMessage(`page-comment-reply-${(page._id).toString()}`, comment);


        } else {
            comment = await this.commentService.create({creator: user._id, post: id, root: true, ...createCommentDto});
            await this.pageService.findOneRecordAndUpdate({_id: id}, {$push: {comments: comment._id}});

            //@ts-ignore
            if (user._id != page.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: page._id,
                    message: 'commented on your page.',
                    type: NotificationType.PAGE_COMMENTED,
                    sender: user._id,
                    //@ts-ignore
                    receiver: post.creator._id,
                });
                // check if user has fcm token then send notification to that user.
                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: {title: `${user.firstName} ${user.lastName} commented on your post.`},
                        data: {post: page._id.toString(), type: NotificationType.PAGE_COMMENTED},
                    });
                }


                this.socketService.triggerMessage(`page-comment-${(page._id).toString()}`, comment);


            }
        }

        return comment;
    }

    @Get(':id/comment/find-all')
    async findAllComments(@Param('id', ParseObjectId) id: string, @Query() {page, limit}: FindAllCommentQueryDto) {
        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, skip: $q.skip, sort: $q.sort};
        const condition = {post: id, root: true};
        const comments = await this.commentService.find(condition, options);
        const total = await this.commentService.countRecords({post: id});
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: comments,
        };
        return paginated;
    }


    @Delete(':pageId/comment/:id/delete')
    async deleteComment(@Param('id', ParseObjectId) id: string, @Param('pageId', ParseObjectId) pageId: string, @GetUser() user: UserDocument) {
        const comment = await this.commentService.findOneRecord({_id: id});
        if (!comment) throw new HttpException('Comment does not exist.', HttpStatus.BAD_REQUEST);
        if (comment.creator.toString() == user._id) {
            const deletedComment = await this.commentService.deleteSingleRecord({_id: id});
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({_id: deletedComment.comment}, {$pull: {replies: deletedComment._id}});
            } else {
                await this.pageService.findOneRecordAndUpdate({_id: deletedComment.page}, {$pull: {comments: deletedComment._id}});
            }
            return {message: 'Comment deleted successfully.'};
        } else {
            const page = await this.pageService.findOneRecord({_id: comment.page})
            const moderator = (page.moderators).findIndex((moderator) => (moderator.user).toString() === (user._id).toString());
            if (moderator === -1) throw new UnauthorizedException();
            const deletedComment = await this.commentService.deleteSingleRecord({_id: id});
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({_id: deletedComment.comment}, {$pull: {replies: deletedComment._id}});
            } else {
                await this.pageService.findOneRecordAndUpdate({_id: deletedComment.page}, {$pull: {comments: deletedComment._id}});
            }
            return {message: 'Comment deleted successfully.'};
        }
    }


    @Post('reaction/create')
    async addReactions(@Body() addReactionsDto: AddReactionsDto, @GetUser() user: UserDocument) {
        // check if user is adding reaction in comment
        if (addReactionsDto.comment) {
            const comment = await this.commentService.findOneRecord({_id: addReactionsDto.comment}).populate('creator');
            if (!comment) throw new BadRequestException('Comment does not exist.');
            const reaction = await this.reactionService.create({
                user: user._id,
                emoji: addReactionsDto.emoji,
                comment: comment._id
            });
            await this.commentService.findOneRecordAndUpdate({_id: comment._id}, {$push: {reactions: reaction._id}});
            return reaction;
        } else {
            const page = await this.pageService.findOneRecord({_id: addReactionsDto.post}).populate('creator');
            if (!page) throw new HttpException('Page does not exists', HttpStatus.BAD_REQUEST);
            const reaction = await this.reactionService.create({
                user: user._id,
                emoji: addReactionsDto.emoji,
                page: page._id
            });
            await this.pageService.findOneRecordAndUpdate({_id: page._id}, {$push: {reactions: reaction._id}});
            //@ts-ignore
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    page: page._id,
                    message: 'reacted to your page.',
                    type: NotificationType.PAGE_REACTED,
                    sender: user._id,
                    //@ts-ignore
                    receiver: post.creator._id,
                });

                if (page.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: page.creator.fcmToken,
                        notification: {title: `${user.firstName} ${user.lastName} reacted on your page.`},
                        data: {post: page._id.toString(), type: NotificationType.PAGE_REACTED},
                    });
                }
            }
            return reaction;
        }
    }

    @Delete('reaction/:id/delete')
    async deleteReaction(@Param('id', ParseObjectId) id: string) {
        const reaction = await this.reactionService.deleteSingleRecord({_id: id});
        if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
        if (reaction.page) await this.pageService.findOneRecordAndUpdate({_id: reaction.page},
            {$pull: {reactions: reaction._id}});
        else if (reaction.comment) await this.commentService.findOneRecordAndUpdate({_id: reaction.comment},
            {$pull: {reactions: reaction._id}});
        return reaction;
    }

    @Put('reaction/:id/update')
    async updateReaction(@Param('id', ParseObjectId) id: string, @Body() updateReactionsDto: UpdateReactionsDto) {
        return await this.reactionService.update({_id: id}, {emoji: updateReactionsDto.emoji});
    }


}
