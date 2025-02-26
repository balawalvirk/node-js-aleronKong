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
import {UserController} from "src/users/users.controller";
import {DeleteReactionDto} from "src/posts/dtos/delete-reaction.dto";

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



    @Put('reaction/update')
    async updateReaction(@Body() payload: UpdateReactionsDto, @GetUser() user: UserDocument) {
        let page;


        let pageQuery={page:null};
        if(payload.page){

            page = await this.pageService.findOneRecord({_id: payload.page})
            pageQuery={page:payload.page}
        }
        if(payload.post){

            let reaction = await this.reactionService.update({post: payload.post,user:user._id,...pageQuery},
                {emoji: payload.emoji});
            if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
            reaction.page=page;
            return reaction;
        }else if(payload.comment){
            let reaction = await this.reactionService.update({comment: payload.comment,user:user._id,...pageQuery},
                {emoji: payload.emoji});
            if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
            reaction.page=page;
            return reaction;


        }

        return {};
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


    @Get(':id/find-one')
    async findOne(@Param('id', ParseObjectId) id: string,@GetUser() user: UserDocument) {

        const post:any=await this.postsService.findOne({_id: id});

        if(post.privacy===PostPrivacy.FOLLOWERS){

            const postCreatorFriends=await this.userService.findOne({_id:post.creator._id,friends:user._id})

            if(!postCreatorFriends)
            throw new BadRequestException('Post does not exists.');
        }

        return post;
    }

    //find post of a specific user
    @Get('find-all/user/:id')
    async findUserPost(@Param('id', ParseObjectId) id: string, @Query('page') page: string, @Query('limit') limit: string,
                       @GetUser() user: UserDocument) {
        const $q = makeQuery({page, limit});


        const userFound = await this.userService.findOneRecord({_id: id});
        if(userFound && (userFound.blockedUsers || []).indexOf(user._id)!==-1)
            throw new BadRequestException('You have been blocked by this user.');


        const condition = {creator: new mongoose.Types.ObjectId(id)};
        const options = {sort: $q.sort, limit: $q.limit, skip: $q.skip,page:$q.page,perPage:10};
        const {total,posts} = await this.postsService.findPostsFilteredByPrivacy(user._id,condition, options);
        const paginated = {
            total,
            pages: Math.ceil(total / $q.limit),
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
        let followedPagesPosts: any = (await this.pageService.findAllRecords({'followers.follower': user._id}).select('posts'))
            .reduce((accumulator,current)=>accumulator.concat(current.posts || []),[])
        let groupJoinedPosts: any = (await this.groupService.findAllRecords({'members.member': user._id}).select('posts'))
            .reduce((accumulator,current)=>accumulator.concat(current.posts || []),[])


        let pageFollowings = []
        let groups = [];
        let pageGroups = [];
        let allGroups = [];


        const reports = await this.reportService.findAllRecords({reporter: user._id, type: ReportType.USER});
        const reportedUsers = reports.map((report) => report.user);
        // find all groups that user has joined
        groups = (await this.groupService.findAllRecords({$or:[{'members.member': user._id,creator:user._id}]}))
            .map((group) => group._id);
        allGroups = pageGroups.concat(groups);
        const condition = {
            creator: {$nin: [...user.blockedUsers,...user.blockedByOthers, ...reportedUsers]},
            isBlocked: false,
            status: PostStatus.ACTIVE,
            $or:[
                {creator:{$in:user.friends}},
                {_id:followedPagesPosts.concat(groupJoinedPosts)}
            ]
            /*$or: user.isGuildMember
                ? [
                    {privacy: PostPrivacy.PUBLIC},
                    {privacy: PostPrivacy.FOLLOWERS, creator: {$in: followings}},
                    {privacy: PostPrivacy.GUILD_MEMBERS},
                    {privacy: PostPrivacy.GROUP, group: {$in: allGroups}},
                    {page: {$in: pageFollowings}},
                    {creator: user._id},
                    {tagged: {$in: [user._id]}},
                    {mentions: {$in: [user._id]}},

                ]
                : [
                    {privacy: PostPrivacy.PUBLIC},
                    {privacy: PostPrivacy.FOLLOWERS, creator: {$in: followings}},
                    {creator: user._id},
                    {page: {$in: pageFollowings}},
                    {privacy: PostPrivacy.GROUP, group: {$in: allGroups}},
                    {tagged: {$in: [user._id]}},
                    {mentions: {$in: [user._id]}},

                ],
                */
        };

        const {total,posts} = await this.postsService.findHomePosts(user._id,condition, options);

        const totalPosts = await Promise.all(
            posts.map(async (post) => {
                const totalComments = await this.commentService.countRecords({post: post._id});
                return {...post, totalComments};
            })
        );

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

        let {total,posts} = await this.postsService.findHomePosts(user._id,condition, options);


        //let randomPosts = await this.postsService.getRandomPosts(user._id);


        const totalPosts = await Promise.all(
            (posts).map(async (post) => {
                const totalComments = await this.commentService.countRecords({post: post._id});
                return {...post, totalComments};
            })
        );

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
        const post:any = await this.postsService.update({_id: id}, {$push: {likes: user._id}});

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);
        const isOtherUserBlock=(user.blockedByOthers).findIndex((u)=>u.toString()===(id).toString());

        if(isUserBlock!==-1 || isOtherUserBlock!==-1)
            throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);


        //@ts-ignore
        if (user._id != post.creator._id.toString()) {



            const userData = await this.userService.findOneRecord({_id: post.creator._id});
            if (userData) {
                const notificationData = await this.userService.getNotificationData(userData, {pageId: null});
                this.socketService.triggerMessage(`notification-${(userData._id).toString()}`, {data: notificationData});
            }

            if (userData.fcmToken && userData.newPostsNotifications) {
                await this.firebaseService.sendNotification({
                    token: userData.fcmToken,
                    notification: {title: `${user.firstName} ${user.lastName} liked your post.`},
                    data: {post: post._id.toString(), type: NotificationType.POST_LIKED},
                });


                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'liked your post.',
                    type: NotificationType.POST_LIKED,
                    sender: user._id,
                    //@ts-ignore
                    receiver: userData._id,
                });

            }
        }

        return post;
    }

    @Put('un-like/:id')
    async unLike(@Param('id', ParseObjectId) id: string, @GetUser() user: UserDocument) {
        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===id);
        const isOtherUserBlock=(user.blockedByOthers).findIndex((u)=>u.toString()===(id).toString());

        if(isUserBlock!==-1 || isOtherUserBlock!==-1)
            throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);

        return await this.postsService.update({_id: id}, {$pull: {likes: user._id}});
    }

    //==============================================================================comments api========================================================
    @Post('comment/:id')
    async createComment(@Param('id') id: string, @GetUser() user: UserDocument, @Body() createCommentDto: CreateCommentDto) {

        let post: any = await this.postsService.findOneRecord({_id: id}).populate('creator');


        if (!post) {
            const tempPost = await this.cacheManager.get(id);
            if (!tempPost)
                throw new BadRequestException('Post does not exists.');
            post = JSON.parse(tempPost);
            post.creator = {_id: post.creator};
        }

        const isUserBlock=(user.blockedUsers).findIndex((u)=>u.toString()===( post.creator._id).toString());
        const isOtherUserBlock=(user.blockedByOthers).findIndex((u)=>u.toString()===( post.creator._id).toString());


        if(isUserBlock!==-1)
            throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);

        if(isOtherUserBlock!==-1)
            throw new HttpException(`You can’t comment on this post as ${post.creator.userName} has blocked you.`, HttpStatus.BAD_REQUEST);


        let page;


        if (createCommentDto.page) {
            page = await this.pageService.findOneRecord({_id: createCommentDto.page})
        }


        let title;


        if(page){
            title=page.name;
        }else{
            title=`${user.firstName} ${user.lastName}`;
        }


        let comment;
        if (createCommentDto.comment) {
            comment = await this.commentService.create({
                creator: user._id,
                post: id, ...createCommentDto, page: page && page._id
            });
            const updatedComment:any = await this.commentService
                .findOneRecordAndUpdate({_id: createCommentDto.comment}, {$push: {replies: comment._id}})
                .populate('creator');



            const userData = await this.userService.findOneRecord({_id: updatedComment.creator._id});
            if (userData) {
                const notificationData = await this.userService.getNotificationData(userData, {pageId: null});
                this.socketService.triggerMessage(`notification-${(userData._id).toString()}`, {data: notificationData});
            }



            if(userData.fcmToken && userData.newPostsNotifications){
                await this.firebaseService.sendNotification({
                    token: userData.fcmToken,
                    notification: {title: `${title} replied to you comment.`},
                    data: {post: post._id.toString(), type: NotificationType.COMMENT_REPLIED},
                });
                await this.notificationService.createRecord({
                    post: post._id,
                    message: 'replied to you comment.',
                    type: NotificationType.COMMENT_REPLIED,
                    sender: user._id,
                    sender_page:page && page._id,
                    //@ts-ignore
                    receiver: userData._id,
                    page: page && page._id
                });


            }



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


                const userData = await this.userService.findOneRecord({_id: post.creator._id});
                if (userData) {
                    const notificationData = await this.userService.getNotificationData(userData, {pageId: null});
                    this.socketService.triggerMessage(`notification-${(userData._id).toString()}`, {data: notificationData});
                }


                // check if user has fcm token then send notification to that user.
                if (userData.fcmToken && userData.newPostsNotifications) {
                    await this.firebaseService.sendNotification({
                        token: userData.fcmToken,
                        notification: {title: `${title} commented on your post.`},
                        data: {post: post._id.toString(), type: NotificationType.POST_COMMENTED},
                    });

                    await this.notificationService.createRecord({
                        post: post._id,
                        message: 'commented on your post.',
                        type: NotificationType.POST_COMMENTED,
                        sender: user._id,
                        sender_page: page && page._id,
                        //@ts-ignore
                        receiver: userData._id,
                        page: page && page._id
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
        const isOtherUserBlock=(user.blockedByOthers).findIndex((u)=>u.toString()===id);

        if(isUserBlock!==-1 || isOtherUserBlock!==-1)
            throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);


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
    async update(@Body() updatePostDto: UpdatePostDto, @Param('id', ParseObjectId) id: string,@GetUser() user: UserDocument) {

        if(updatePostDto.tagged && (updatePostDto.tagged).length>0){
            let tagged=updatePostDto.tagged;
            const isUserBlock=(tagged).findIndex((u:any)=>(user.blockedUsers).indexOf(u.toString())!==-1);
            const isOtherUserBlock=(tagged).findIndex((u:any)=>(user.blockedByOthers).indexOf(u.toString())!==-1);
            if(isUserBlock!==-1 || isOtherUserBlock!==-1)
                throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);
        }


        if(updatePostDto.mentions && (updatePostDto.mentions).length>0){
            let mentions=updatePostDto.mentions;
            const isUserBlock=(mentions).findIndex((u:any)=>(user.blockedUsers).indexOf(u.toString())!==-1);
            const isOtherUserBlock=(mentions).findIndex((u:any)=>(user.blockedByOthers).indexOf(u.toString())!==-1);
            if(isUserBlock!==-1 || isOtherUserBlock!==-1)
                throw new HttpException('You are blocked from accessing this post.', HttpStatus.BAD_REQUEST);
        }

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
        const post:any = await this.postsService.findOne({_id: id});

        if (!post) throw new HttpException('Post does not exists.', HttpStatus.BAD_REQUEST);

        if ((post.creator._id).toString() == (user._id).toString()) {
            await this.postsService.findOneRecordAndUpdate({_id: id}, pinUnpinDto);
        } else {
            const moderator = await this.isGroupModerator(id, user._id);

            const groupCreator = await this.groupService.findOneRecord({_id: post.group, creator: user._id});


            if ((!moderator || !moderator.pinPosts) && !groupCreator) throw new UnauthorizedException();
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




    @Post('reaction/create')
    async addReactions(@Body() addReactionsDto: AddReactionsDto, @GetUser() user: UserDocument) {
        // check if user is adding reaction in comment

        let page;

        let title=`${user.firstName} ${user.lastName}`;

        if (addReactionsDto.page) {
            page = await this.pageService.findOneRecord({_id: addReactionsDto.page});

            title=page.name;
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
            const post:any = await this.postsService.findOneRecord({_id: addReactionsDto.post}).populate('creator');
            if (!post) throw new HttpException('Post does not exists', HttpStatus.BAD_REQUEST);




            const reaction = await this.reactionService.create({
                user: user._id,
                emoji: addReactionsDto.emoji,
                post: post._id,
                page: addReactionsDto.page

            });
            await this.postsService.findOneRecordAndUpdate({_id: post._id}, {$push: {reactions: reaction._id}});
            //@ts-ignore
            if (user._id != post.creator._id.toString()) {


                let userData;
                if (post.creator._id) {
                    userData = await this.userService.findOneRecord({_id: post.creator._id});
                    if (userData) {
                        const notificationData = await this.userService.getNotificationData(userData, {pageId: null});
                        this.socketService.triggerMessage(`notification-${(userData._id).toString()}`, {data: notificationData});
                    }
                }


                if ( userData && userData.fcmToken && userData.newPostsNotifications) {
                    await this.firebaseService.sendNotification({
                        token: userData.fcmToken,
                        notification: {title: `${title} reacted to your post.`},
                        data: {post: post._id.toString(), type: NotificationType.POST_REACTED},
                    });


                    await this.notificationService.createRecord({
                        post: post._id,
                        message: 'reacted to your post.',
                        type: NotificationType.POST_REACTED,
                        sender: user._id,
                        sender_page:addReactionsDto.page,
                        //@ts-ignore
                        receiver: userData._id,
                        page: addReactionsDto.page
                    });

                }
            }
            reaction.page = page;
            return reaction;
        }
    }


    @Delete('reaction/delete')
    async deleteReaction(@Body() payload: DeleteReactionDto,@GetUser() user: UserDocument) {
        let page={page:null};
        if(payload.page){
            page={page:payload.page}
        }
        if(payload.post){

            let reaction = await this.reactionService.deleteSingleRecord({post: payload.post,user:user._id,...page});
            if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
            await this.postsService.findOneRecordAndUpdate({_id: reaction.post}, {$pull: {reactions: reaction._id}});
            return reaction;
        }else if(payload.comment){
            let reaction = await this.reactionService.deleteSingleRecord({comment: payload.comment,user:user._id,...page});
            if (!reaction) throw new HttpException('Reaction does not exists', HttpStatus.BAD_REQUEST);
            await this.commentService.findOneRecordAndUpdate({_id: payload.comment}, {$pull: {reactions: reaction._id}});

            return reaction;


        }
        return {};
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

            if(comments.length>0 || reactions.length>0){
                const condition = {$or: [{reactions: {$in: [reactions]}}, {comments: {$in: comments}}]};
                ({posts,total} = await this.postsService.find(user._id,condition, options));
            }else{
                posts=[];
                total=0;
            }

        } else if (filter === EngagedPostFilter.LIKED) {
            const reactions = (await this.reactionService.findAllRecords({user: user._id}).select('_id')).map((reaction) => reaction._id);

            if( reactions.length>0){
                const condition = {$or: [{reactions: {$in: [reactions]}}]};
                ({posts,total} = await this.postsService.find(user.id,condition));



            }else{
                posts=[];
                total=0;
            }

        } else if (filter === EngagedPostFilter.COMMENTED) {
            const comments = (await this.commentService.findAllRecords({creator: user._id}).select('_id')).map((comment) => comment._id);


            if( comments.length>0){
                const condition = {comments: {$in: comments}};
                ({posts,total} = await this.postsService.find(user.id,condition));
            }else{
                posts=[];
                total=0;
            }
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
