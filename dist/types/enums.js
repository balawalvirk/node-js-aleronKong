"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngagedPostFilter = exports.MediaType = exports.PageFilter = exports.BoughtProductsSort = exports.FriendRequestStatus = exports.GroupInvitationStatus = exports.PostSort = exports.AGORA_RTC_ROLE = exports.TransectionDuration = exports.SellerRequest = exports.Emoji = exports.SearchSort = exports.SearchFilter = exports.OrderStatus = exports.ReportType = exports.NotificationType = exports.MuteInterval = exports.PostStatus = exports.PostType = exports.PostPrivacy = exports.CollectionConditions = exports.CollectionTypes = exports.ProductType = exports.ProductStatus = exports.GroupPrivacy = exports.UserStatus = exports.AuthTypes = exports.UserRoles = void 0;
var UserRoles;
(function (UserRoles) {
    UserRoles["CUSTOMER"] = "customer";
    UserRoles["SELLER"] = "seller";
    UserRoles["ADMIN"] = "admin";
})(UserRoles = exports.UserRoles || (exports.UserRoles = {}));
var AuthTypes;
(function (AuthTypes) {
    AuthTypes["LOCAL"] = "local";
    AuthTypes["INSTAGRAM"] = "instagram";
    AuthTypes["TWITTER"] = "twitter";
    AuthTypes["FACEBOOK"] = "facebook";
    AuthTypes["GOOGLE"] = "google";
})(AuthTypes = exports.AuthTypes || (exports.AuthTypes = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["BLOCKED"] = "blocked";
    UserStatus["ACTIVE"] = "active";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
var GroupPrivacy;
(function (GroupPrivacy) {
    GroupPrivacy["PUBLIC"] = "public";
    GroupPrivacy["PRIVATE"] = "private";
})(GroupPrivacy = exports.GroupPrivacy || (exports.GroupPrivacy = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["ARCHIEVED"] = "archived";
    ProductStatus["DRAFT"] = "draft";
})(ProductStatus = exports.ProductStatus || (exports.ProductStatus = {}));
var ProductType;
(function (ProductType) {
    ProductType["PHYSICAL"] = "physical";
    ProductType["DIGITAL"] = "digital";
})(ProductType = exports.ProductType || (exports.ProductType = {}));
var CollectionTypes;
(function (CollectionTypes) {
    CollectionTypes["MANUAL"] = "manual";
    CollectionTypes["AUTOMATED"] = "automated";
})(CollectionTypes = exports.CollectionTypes || (exports.CollectionTypes = {}));
var CollectionConditions;
(function (CollectionConditions) {
    CollectionConditions["All"] = "all";
    CollectionConditions["ANY"] = "any";
})(CollectionConditions = exports.CollectionConditions || (exports.CollectionConditions = {}));
var PostPrivacy;
(function (PostPrivacy) {
    PostPrivacy["GUILD_MEMBERS"] = "guildMembers";
    PostPrivacy["FOLLOWERS"] = "followers";
    PostPrivacy["PUBLIC"] = "public";
    PostPrivacy["GROUP"] = "group";
    PostPrivacy["PAGE"] = "page";
})(PostPrivacy = exports.PostPrivacy || (exports.PostPrivacy = {}));
var PostType;
(function (PostType) {
    PostType["POST"] = "post";
    PostType["FUNDRAISING"] = "fundraising";
})(PostType = exports.PostType || (exports.PostType = {}));
var PostStatus;
(function (PostStatus) {
    PostStatus["ACTIVE"] = "active";
    PostStatus["INACTIVE"] = "inActive";
})(PostStatus = exports.PostStatus || (exports.PostStatus = {}));
var MuteInterval;
(function (MuteInterval) {
    MuteInterval["WEEK"] = "week";
    MuteInterval["DAY"] = "day";
    MuteInterval["CUSTOM"] = "custom";
})(MuteInterval = exports.MuteInterval || (exports.MuteInterval = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["NEW_MESSAGE"] = "newMessage";
    NotificationType["GROUP_JOIN_REQUEST"] = "groupJoinRequest";
    NotificationType["GROUP_JOIN_REQUEST_APPROVED"] = "groupJoinRequestApproved";
    NotificationType["GROUP_JOIN_REQUEST_REJECTED"] = "groupJoinRequestRejected";
    NotificationType["GROUP_JOINED"] = "groupJoined";
    NotificationType["POST_LIKED"] = "postLiked";
    NotificationType["POST_COMMENTED"] = "postCommented";
    NotificationType["USER_FOLLOWING"] = "userFollowing";
    NotificationType["USER_SUPPORTING"] = "userSupporting";
    NotificationType["ORDER_PLACED"] = "orderPlaced";
    NotificationType["PRODUCT_BOUGHT"] = "productBought";
    NotificationType["FUNDRAISING_PROJECT_APPROVED"] = "fundraisingProjectApproved";
    NotificationType["FUNDRAISING_PROJECT_FUNDED"] = "fundraisingProjectFunded";
    NotificationType["NEW_GROUP_POST"] = "newGroupPost";
    NotificationType["USER_TAGGED"] = "userTagged";
    NotificationType["SELLER_REQUEST"] = "sellerRequest";
    NotificationType["SELLER_REQUEST_APPROVED_REJECTED"] = "sellerRequestApproveRejected";
    NotificationType["POST_REACTED"] = "postReacted";
    NotificationType["COMMENT_REACTED"] = "commentReacted";
    NotificationType["GROUP_INVITATION"] = "groupInvitation";
    NotificationType["PAGE_INVITATION"] = "pageInvitation";
    NotificationType["PAGE_JOIN_REQUEST"] = "pageJoinRequest";
    NotificationType["FRIEND_REQUEST"] = "friendRequest";
    NotificationType["COMMENT_REPLIED"] = "commentReplied";
    NotificationType["PAGE_JOIN_REQUEST_APPROVED"] = "pageJoinRequestApproved";
    NotificationType["PAGE_JOIN_REQUEST_REJECTED"] = "pageJoinRequestRejected";
    NotificationType["PAGE_FOLLOW_ACCEPTED"] = "pageFollows";
    NotificationType["PAGE_MODERATOR"] = "\u2019pageModerator\u2019";
    NotificationType["PAGE_COMMENTED"] = "pageCommented";
    NotificationType["PAGE_REACTED"] = "pageReacted";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
var ReportType;
(function (ReportType) {
    ReportType["GROUP"] = "group";
    ReportType["USER"] = "user";
})(ReportType = exports.ReportType || (exports.ReportType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELED"] = "canceled";
    OrderStatus["CANCEL_REQUESTED"] = "cancelRequested";
    OrderStatus["ACTIVE"] = "active";
    OrderStatus["COMPLETED"] = "completed";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var SearchFilter;
(function (SearchFilter) {
    SearchFilter["ALL"] = "all";
    SearchFilter["PRODUCTS"] = "products";
    SearchFilter["GROUPS"] = "groups";
    SearchFilter["PEOPLE"] = "prople";
})(SearchFilter = exports.SearchFilter || (exports.SearchFilter = {}));
var SearchSort;
(function (SearchSort) {
    SearchSort["CREATED_AT"] = "createdAt";
    SearchSort["NAME"] = "name";
    SearchSort["RATING"] = "rating";
    SearchSort["DEFAULT"] = "default";
})(SearchSort = exports.SearchSort || (exports.SearchSort = {}));
var Emoji;
(function (Emoji) {
    Emoji["like"] = "like";
    Emoji["LOVE"] = "love";
    Emoji["LAUGH"] = "laugh";
    Emoji["DIS_LIKE"] = "dislike";
    Emoji["WOW"] = "wow";
    Emoji["SAD"] = "sad";
})(Emoji = exports.Emoji || (exports.Emoji = {}));
var SellerRequest;
(function (SellerRequest) {
    SellerRequest["PENDING"] = "pending";
    SellerRequest["APPROVED"] = "approved";
    SellerRequest["REJECTED"] = "rejected";
})(SellerRequest = exports.SellerRequest || (exports.SellerRequest = {}));
var TransectionDuration;
(function (TransectionDuration) {
    TransectionDuration["MONTH"] = "month";
    TransectionDuration["WEEK"] = "week";
    TransectionDuration["YEAR"] = "year";
})(TransectionDuration = exports.TransectionDuration || (exports.TransectionDuration = {}));
var AGORA_RTC_ROLE;
(function (AGORA_RTC_ROLE) {
    AGORA_RTC_ROLE["PUBLISHER"] = "publisher";
    AGORA_RTC_ROLE["AUDIENCE"] = "audience";
})(AGORA_RTC_ROLE = exports.AGORA_RTC_ROLE || (exports.AGORA_RTC_ROLE = {}));
var PostSort;
(function (PostSort) {
    PostSort["MOST_RECENT"] = "mostRecent";
    PostSort["RECENT_INTERACTIONS"] = "recentInteractions";
})(PostSort = exports.PostSort || (exports.PostSort = {}));
var GroupInvitationStatus;
(function (GroupInvitationStatus) {
    GroupInvitationStatus["PENDING"] = "pending";
    GroupInvitationStatus["APPROVED"] = "approved";
    GroupInvitationStatus["REJECTED"] = "rejected";
})(GroupInvitationStatus = exports.GroupInvitationStatus || (exports.GroupInvitationStatus = {}));
var FriendRequestStatus;
(function (FriendRequestStatus) {
    FriendRequestStatus["PENDING"] = "pending";
    FriendRequestStatus["APPROVED"] = "approved";
    FriendRequestStatus["REJECTED"] = "rejected";
})(FriendRequestStatus = exports.FriendRequestStatus || (exports.FriendRequestStatus = {}));
var BoughtProductsSort;
(function (BoughtProductsSort) {
    BoughtProductsSort["TITLE"] = "title";
    BoughtProductsSort["AUTHOR"] = "author";
    BoughtProductsSort["UNREAD"] = "unread";
})(BoughtProductsSort = exports.BoughtProductsSort || (exports.BoughtProductsSort = {}));
var PageFilter;
(function (PageFilter) {
    PageFilter["ALL"] = "all";
    PageFilter["POPULAR"] = "popular";
    PageFilter["SUGGESTED"] = "suggested";
    PageFilter["LATEST"] = "latest";
    PageFilter["CREATED"] = "created";
    PageFilter["MODERATING"] = "moderating";
    PageFilter["FOLLOWING"] = "following";
})(PageFilter = exports.PageFilter || (exports.PageFilter = {}));
var MediaType;
(function (MediaType) {
    MediaType["VIDEO"] = "video";
    MediaType["IMAGE"] = "image";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
var EngagedPostFilter;
(function (EngagedPostFilter) {
    EngagedPostFilter["ALL"] = "all";
    EngagedPostFilter["LIKED"] = "liked";
    EngagedPostFilter["COMMENTED"] = "commented";
})(EngagedPostFilter = exports.EngagedPostFilter || (exports.EngagedPostFilter = {}));
//# sourceMappingURL=enums.js.map