import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    ValidationPipe,
    UsePipes,
    ParseBoolPipe,
    HttpException,
    HttpStatus,
    UnauthorizedException,
    BadRequestException, Inject, CACHE_MANAGER,
} from '@nestjs/common';
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard';
import {RolesGuard} from 'src/auth/role.guard';
import {FirebaseService} from 'src/firebase/firebase.service';
import {GroupService} from 'src/group/group.service';
import {ModeratorService} from 'src/group/moderator.service';
import {makeQuery, ParseObjectId, Roles, SocketGateway} from 'src/helpers';
import {GetUser} from 'src/helpers/decorators/user.decorator';
import {NotificationService} from 'src/notification/notification.service';
import {ReportService} from 'src/report/report.service';
import {EngagedPostFilter, NotificationType, PostPrivacy, PostStatus, ReportType, UserRoles} from 'src/types';
import {UserDocument} from 'src/users/users.schema';
import {UsersService} from 'src/users/users.service';
import {CommentService} from './comment.service';
import {AddReactionsDto} from './dtos/add-reactions.dto';
import {CreateCommentDto} from './dtos/create-comment';
import {FeatureUnFeatureDto} from './dtos/feature-unfeature.dto';
import {FindAllCommentQueryDto} from './dtos/find-all-comments.query.dto';
import {FindAllPostQuery} from './dtos/find-all-post.query.dto';
import {FindEngagedPostQuery} from './dtos/find-engaged-posts.query.dto';
import {FindHomePostQueryDto} from './dtos/find-home-post.query.dto';
import {PinUnpinDto} from './dtos/pin-unpin-post.dto';
import {UpdateCommentDto} from './dtos/update-comment.dto';
import {UpdatePostDto} from './dtos/update-post.dto';
import {UpdateReactionsDto} from './dtos/update-reaction.dto';
import {PostsService} from './posts.service';
import {ReactionService} from './reaction.service';
import Cache from 'cache-manager';
import {PageService} from "src/page/page.service";
import mongoose from "mongoose";

@Controller('post')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly userService: UsersService,
        private readonly commentService: CommentService,
        private readonly firebaseService: FirebaseService,
        private readonly notificationService: NotificationService,
        private readonly reactionService: ReactionService,
        private readonly groupService: GroupService,
        private readonly moderatorService: ModeratorService,
        private readonly reportService: ReportService,
        private readonly socketService: SocketGateway,
        private readonly pageService: PageService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
    }

    @Roles(UserRoles.ADMIN)
    @Get('find-all')
    @UsePipes(new ValidationPipe({transform: true}))
    async findAll(@Query() {page, limit, query}: FindAllPostQuery) {
        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, skip: $q.skip, sort: $q.sort};
        const rjx = {$regex: query, $options: 'i'};
        const condition = {content: rjx};
        const posts = await this.postsService.findAllRecords(condition, options).populate('creator');
        const total = await this.postsService.countRecords(condition);
        const paginated = {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }


    @Post('reaction/create')
    async addReactions(@Body() addReactionsDto: AddReactionsDto, @GetUser() user: UserDocument) {
        // check if user is adding reaction in comment

        let page;


        if (addReactionsDto.page) {
            page = await this.pageService.findOneRecord({_id: addReactionsDto.page})

        }

        if (addReactionsDto.comment) {


            const comment = await this.commentService.findOneRecord({_id: addReactionsDto.comment}).populate('creator');
            if (!comment) throw new BadRequestException('Comment does not exist.');
            const reaction = await this.reactionService.create({
                user: user._id,
                emoji: addReactionsDto.emoji,
                comment: comment._id,
                page: addReactionsDto.page
            });
            await this.commentService.findOneRecordAndUpdate({_id: comment._id}, {$push: {reactions: reaction._id}});
            reaction.page = page
            return reaction;
        } else {
            const post = await this.postsService.findOneRecord({_id: addReactionsDto.post}).populate('creator');
            if (!post) throw new HttpException('Post does not exists', HttpStatus.BAD_REQUEST);


            const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===post.creator._id.toString());
            if(isUserBlock!==-1)
                throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);


            const reaction = await this.reactionService.create({
                user: user._id,
                emoji: addReactionsDto.emoji,
                post: post._id,
                page: addReactionsDto.page

            });
            await this.postsService.findOneRecordAndUpdate({_id: post._id}, {$push: {reactions: reaction._id}});
            //@ts-ignore
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'reacted to your post.',
                    type: NotificationType.POST_REACTED,
                    sender: user._id,
                    //@ts-ignore
                    receiver: post.creator._id,
                    page: addReactionsDto.page
                });

                if (post.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: post.creator.fcmToken,
                        notification: {title: `${user.firstName} ${user.lastName} reacted on your post.`},
                        data: {post: post._id.toString(), type: NotificationType.POST_REACTED},
                    });
                }
            }
            reaction.page = page;
            return reaction;
        }
    }

    @Get(':id/find-one')
    async findOne(@Param('id', ParseObjectId) id: string) {
        return await this.postsService.findOne({_id: id});
    }

    //find post of a specific user
    @Get('find-all/user/:id')
    async findUserPost(@Param('id', ParseObjectId) id: string, @Query('page') page: string, @Query('limit') limit: string,
                       @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);

        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);

        const condition = {creator: id};
        const options = {sort: $q.sort, limit: $q.limit, skip: $q.skip};
        const total = await this.postsService.countRecords(condition);
        const posts = await this.postsService.find(condition, options);
        const paginated = {
            total,
            pages: Math.round(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
        return paginated;
    }

    @Get('home')
    @UsePipes(new ValidationPipe({transform: true}))
    async findHomePosts(@GetUser() user: UserDocument, @Query() {limit, page, sort, pageId}: FindHomePostQueryDto) {
        const $q = makeQuery({page, limit});
        const options = {sort: this.postsService.getHomePostSort(sort), limit: $q.limit, skip: $q.skip};
        const followings = (await this.userService.findAllRecords({friends: {$in: [user._id]}}).select('_id')).map((user) => user._id);

        let pageFollowings = []
        let groups = [];
        let pageGroups = [];
        let allGroups = []


        const reports = await this.reportService.findAllRecords({reporter: user._id, type: ReportType.USER});
        const reportedUsers = reports.map((report) => report.user);
        // find all groups that user has joined
        groups = (await this.groupService.findAllRecords({'members.member': user._id})).map((group) => group._id);
        allGroups = pageGroups.concat(pageGroups);
        const condition = {
            creator: {$nin: [...user.blockedUsers, ...reportedUsers]},
            isBlocked: false,
            status: PostStatus.ACTIVE,
            $or: user.isGuildMember
                ? [
                    {privacy: PostPrivacy.PUBLIC},
                    {privacy: PostPrivacy.FOLLOWERS, creator: {$in: followings}},
                    {privacy: PostPrivacy.GUILD_MEMBERS},
                    {privacy: PostPrivacy.GROUP, group: {$in: allGroups}},
                    {page: {$in: pageFollowings}},
                    {creator: user._id},
                ]
                : [
                    {privacy: PostPrivacy.PUBLIC},
                    {privacy: PostPrivacy.FOLLOWERS, creator: {$in: followings}},
                    {creator: user._id},
                    {page: {$in: pageFollowings}},
                    {privacy: PostPrivacy.GROUP, group: {$in: allGroups}},
                ],
        };

        const posts = await this.postsService.findHomePosts(condition, options);

        const totalPosts = await Promise.all(
            posts.map(async (post) => {
                const totalComments = await this.commentService.countRecords({post: post._id});
                return {...post, totalComments};
            })
        );

        const total = await this.postsService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: totalPosts,
        };
        return paginated;
    }


    @Get('home/page/:pageId')
    @UsePipes(new ValidationPipe({transform: true}))
    async findHomePagePosts(@Param('pageId', ParseObjectId) pageId: string,
                            @GetUser() user: UserDocument, @Query() {limit, page, sort}: FindHomePostQueryDto) {
        const $q = makeQuery({page, limit});
        const options = {sort: this.postsService.getHomePostSort(sort), limit: $q.limit, skip: $q.skip};

        let pageFollowings = []
        let groups = [];
        let pageGroups = [];
        let allGroups = [];
        pageFollowings = (await this.pageService.findAllRecords({
            'pageFollwers.page':
                {$in: [pageId]}
        }).select('_id')).map((user) => user._id);
        pageGroups = (await this.groupService.findAllRecords({'page_members.page': pageId})).map((group) => group._id);


        // find all groups that user has joined
        allGroups = pageGroups.concat(pageGroups);
        const condition = {
            isBlocked: false,
            status: PostStatus.ACTIVE,
            $or: [
                {page: {$in: pageFollowings}},
                {privacy: PostPrivacy.GROUP, group: {$in: allGroups}},
            ],
        };

        let posts = await this.postsService.findHomePosts(condition, options);


        posts = await this.postsService.getRandomPosts();


        const totalPosts = await Promise.all(
            posts.map(async (post) => {
                const totalComments = await this.commentService.countRecords({post: post._id});
                return {...post, totalComments};
            })
        );

        const total = await this.postsService.countRecords(condition);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: totalPosts,
        };
        return paginated;
    }


    @Post('like/:id')
    async addLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const postExists = await this.postsService.findOneRecord({_id: id, likes: {$in: [user._id]}});
        if (postExists) return await this.postsService.update({_id: id}, {$pull: {likes: user._id}});
        const post = await this.postsService.update({_id: id}, {$push: {likes: user._id}});

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);

        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);


        //@ts-ignore
        if (user._id != post.creator._id.toString()) {
            await this.notificationService.createRecord({
                post: post._id,
                message: 'liked your post.',
                type: NotificationType.POST_LIKED,
                sender: user._id,
                //@ts-ignore
                receiver: post.creator._id,
            });
            if (post.creator.fcmToken) {
                await this.firebaseService.sendNotification({
                    token: post.creator.fcmToken,
                    notification: {title: `${user.firstName} ${user.lastName} liked your post.`},
                    data: {post: post._id.toString(), type: NotificationType.POST_LIKED},
                });
            }
        }

        return post;
    }

    @Put('un-like/:id')
    async unLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);

        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);

        return await this.postsService.update({_id: id}, {$pull: {likes: user._id}});
    }

    //==============================================================================comments api========================================================
    @Post('comment/:id')
    async createComment(@Param('id') id: string, @GetUser() user: UserDocument, @Body() createCommentDto: CreateCommentDto) {

        let post: any = await this.postsService.findOneRecord({_id: id}).populate('creator');

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);
        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);


        let page;


        if (createCommentDto.page) {
            page = await this.pageService.findOneRecord({_id: createCommentDto.page})
        }

        if (!post) {
            const tempPost = await this.cacheManager.get(id);
            if (!tempPost)
                throw new BadRequestException('Post does not exists.');
            post = JSON.parse(tempPost);
            post.creator = {_id: post.creator};
        }


        let comment;
        if (createCommentDto.comment) {
            comment = await this.commentService.create({
                creator: user._id,
                post: id, ...createCommentDto, page: page && page._id
            });
            const updatedComment = await this.commentService
                .findOneRecordAndUpdate({_id: createCommentDto.comment}, {$push: {replies: comment._id}})
                .populate('creator');

            await this.notificationService.createRecord({
                post: post._id,
                message: 'replied to you comment.',
                type: NotificationType.COMMENT_REPLIED,
                sender: user._id,
                //@ts-ignore
                receiver: updatedComment.creator._id,
                page: page && page._id
            });

            await this.firebaseService.sendNotification({
                token: updatedComment.creator.fcmToken,
                notification: {title: `${user.firstName} ${user.lastName} replied to you comment.`},
                data: {post: post._id.toString(), type: NotificationType.COMMENT_REPLIED},
            });

            comment.page = page;
            this.socketService.triggerMessage(`post-comment-reply-${(post._id).toString()}`, comment);


        } else {
            comment = await this.commentService.create({
                creator: user._id,
                post: id, root: true, ...createCommentDto, page: page && page._id
            });
            await this.postsService.findOneRecordAndUpdate({_id: id}, {$push: {comments: comment._id}});

            //@ts-ignore
            if (user._id != post.creator._id.toString()) {
                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'commented on your post.',
                    type: NotificationType.POST_COMMENTED,
                    sender: user._id,
                    //@ts-ignore
                    receiver: post.creator._id,
                    page: page && page._id
                });
                // check if user has fcm token then send notification to that user.
                if (post.creator.fcmToken) {
                    await this.firebaseService.sendNotification({
                        token: post.creator.fcmToken,
                        notification: {title: `${user.firstName} ${user.lastName} commented on your post.`},
                        data: {post: post._id.toString(), type: NotificationType.POST_COMMENTED},
                    });
                }
            }

            comment.page = page;
            this.socketService.triggerMessage(`post-comment-${(post._id).toString()}`, comment);

        }
        comment.page = page;
        return comment;
    }

    @Get(':id/comment/find-all')
    async findAllComments(@Param('id', ParseObjectId) id: string, @Query() {page, limit}: FindAllCommentQueryDto,
                          @GetUser() user: UserDocument) {

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);

        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);


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

    @Put('comment/update')
    async updateComment(@Body() {commentId, postId, ...rest}: UpdateCommentDto) {
        const updated = await this.commentService.update({_id: commentId}, rest);
        const page = await this.pageService.findOneRecord({_id: updated.page});
        updated.page = page;
        return updated;
    }


    @Get('page/:id/following')
    async getPostPageFollowing(@Param('id', ParseObjectId) id: string, @Query() {limit, page, sort}: FindHomePostQueryDto,
                               @GetUser() user: UserDocument) {

        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, skip: $q.skip, sort: $q.sort};


        const pageFollowings = (await this.pageService.findAllRecords({
            'followers.page':
                {$in: [new mongoose.Types.ObjectId(id)]}
        }).select('_id')).map((page) => page._id);
        const followingPages = await this.postsService.find({page: {$in: pageFollowings}}, options);

        const total = await this.postsService.countRecords({page: {$in: pageFollowings}});


        return {
            total,
            pages: Math.floor(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: followingPages,
        };
    }


    async isGroupModerator(postId: string, userId: string) {
        const post = await this.postsService.findOneRecord({_id: postId});
        // check if post is not group post then throw exception
        if (!post.group) return false;
        const moderator = await this.moderatorService.findOneRecord({group: post.group, user: userId});
        //check if user is moderator
        if (!moderator) return false;
        else return moderator;
    }

    @Delete(':postId/comment/:id/delete')
    async deleteComment(@Param('id', ParseObjectId) id: string, @Param('postId', ParseObjectId) postId: string, @GetUser() user: UserDocument) {
        const comment = await this.commentService.findOneRecord({_id: id});
        if (!comment) throw new HttpException('Comment does not exist.', HttpStatus.BAD_REQUEST);
        if (comment.creator.toString() == user._id) {
            const deletedComment = await this.commentService.deleteSingleRecord({_id: id});
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({_id: deletedComment.comment}, {$pull: {replies: deletedComment._id}});
            } else {
                await this.postsService.findOneRecordAndUpdate({_id: deletedComment.post}, {$pull: {comments: deletedComment._id}});
            }
            return {message: 'Comment deleted successfully.'};
        } else {
            const moderator = await this.isGroupModerator(postId, user._id);
            if (!moderator || !moderator.deleteComments) throw new UnauthorizedException();
            const deletedComment = await this.commentService.deleteSingleRecord({_id: id});
            if (deletedComment.comment) {
                await this.commentService.findOneRecordAndUpdate({_id: deletedComment.comment}, {$pull: {replies: deletedComment._id}});
            } else {
                await this.postsService.findOneRecordAndUpdate({_id: deletedComment.post}, {$pull: {comments: deletedComment._id}});
            }
            return {message: 'Comment deleted successfully.'};
        }
    }

    @Put(':id/update')
    async update(@Body() updatePostDto: UpdatePostDto, @Param('id', ParseObjectId) id: string) {
        return await this.postsService.update({_id: id}, updatePostDto);
    }

    @Roles(UserRoles.ADMIN)
    @Put(':id/block-unblock')
    async block(@Param('id', ParseObjectId) id: string, @Query('block', ParseBoolPipe) block: boolean) {
        await this.postsService.findOneRecordAndUpdate({_id: id}, {isBlocked: block === true ? true : false});
        return {message: `Post ${block === true ? 'blocked' : 'unblock'} successfully.`};
    }

    @Put(':id/pin-unpin')
    async pinUnpinPost(@Param('id', ParseObjectId) id: string, @Body() pinUnpinDto: PinUnpinDto, @GetUser() user: UserDocument) {
        const post = await this.postsService.findOne({_id: id});

        if (!post) throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);

        if (post.creator.toString() == user._id || user.role.includes(UserRoles.ADMIN)) {
            await this.postsService.findOneRecordAndUpdate({_id: id}, pinUnpinDto);
        } else {
            const moderator = await this.isGroupModerator(id, user._id);
            if (!moderator || !moderator.pinPosts) throw new UnauthorizedException();
            await this.postsService.findOneRecordAndUpdate({_id: id}, pinUnpinDto);
        }
        return {message: `Post ${pinUnpinDto.pin ? 'pin' : 'un pin'} successfully.`};
    }

    @Roles(UserRoles.ADMIN)
    @Put(':id/feature-unfeature')
    async featureUnFeature(@Param('id', ParseObjectId) id: string, @Body() featureUnFeatureDto: FeatureUnFeatureDto) {
        const post = await this.postsService.findOne({_id: id});
        if (!post) throw new BadRequestException('Post does not exists.');
        return await this.postsService.findOneRecordAndUpdate({_id: id}, featureUnFeatureDto);
    }

    // ====================================================================reactions apis===================================================================


    @Delete('reaction/:id/delete')
    async deleteReaction(@Param('id', ParseObjectId) id: string,@GetUser() user: UserDocument) {
        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);
        if(isUserBlock!==-1)
            throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);


        const reaction = await this.reactionService.deleteSingleRecord({_id: id});
        if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
        if (reaction.post) await this.postsService.findOneRecordAndUpdate({_id: reaction.post}, {$pull: {reactions: reaction._id}});
        else if (reaction.comment) await this.commentService.findOneRecordAndUpdate({_id: reaction.comment}, {$pull: {reactions: reaction._id}});
        return reaction;
    }

    @Put('reaction/:id/update')
    async updateReaction(@Param('id', ParseObjectId) id: string, @Body() updateReactionsDto: UpdateReactionsDto) {
        const updated = await this.reactionService.update({_id: id}, {emoji: updateReactionsDto.emoji});
        const page = await this.pageService.findOneRecord({_id: updated.page});

        updated.page = page;
        return updated;
    }

    @Get('tagged/find-all')
    async findTaggedPosts(@GetUser() user: UserDocument) {
        return await this.postsService.find({tagged: {$in: [user._id]}}, {sort: {createdAt: -1}});
    }

    @Get('media')
    @UsePipes(new ValidationPipe({transform: true}))
    async findPostAssets(@GetUser() user: UserDocument, @Query('type') type: string) {
        const condition = {creator: user._id};
        return await this.postsService.findPostMedia(condition, type);
    }

    @Get('engaged/find-all')
    @UsePipes(new ValidationPipe({transform: true}))
    async findEngagedPosts(@Query() {limit, page, filter}: FindEngagedPostQuery, @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});
        const options = {limit: $q.limit, skip: $q.skip, sort: $q.sort};
        let posts = [];
        let total = 0;
        if (filter === EngagedPostFilter.ALL) {
            const comments = (await this.commentService.findAllRecords({creator: user._id}).select('_id')).map((comment) => comment._id);
            const reactions = (await this.reactionService.findAllRecords({user: user._id}).select('_id')).map((reaction) => reaction._id);
            const condition = {$or: [{reactions: {$in: [reactions]}}, {comments: {$in: comments}}]};
            posts = await this.postsService.find(condition, options);
            total = await this.postsService.countRecords(condition);
        } else if (filter === EngagedPostFilter.LIKED) {
            const reactions = (await this.reactionService.findAllRecords({user: user._id}).select('_id')).map((reaction) => reaction._id);
            const condition = {$or: [{reactions: {$in: [reactions]}}]};
            posts = await this.postsService.find(condition);
            total = await this.postsService.countRecords(condition);
        } else if (filter === EngagedPostFilter.COMMENTED) {
            const comments = (await this.commentService.findAllRecords({creator: user._id}).select('_id')).map((comment) => comment._id);
            const condition = {comments: {$in: comments}};
            posts = await this.postsService.find(condition);
            total = await this.postsService.countRecords(condition);
        }

        return {
            total: total,
            pages: Math.ceil(total / $q.limit),
            page: $q.page,
            limit: $q.limit,
            data: posts,
        };
    }
}
