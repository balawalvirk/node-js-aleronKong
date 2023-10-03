export declare enum UserRoles {
    CUSTOMER = "customer",
    SELLER = "seller",
    ADMIN = "admin"
}
export declare enum AuthTypes {
    LOCAL = "local",
    INSTAGRAM = "instagram",
    TWITTER = "twitter",
    FACEBOOK = "facebook",
    GOOGLE = "google"
}
export declare enum UserStatus {
    BLOCKED = "blocked",
    ACTIVE = "active"
}
export declare enum GroupPrivacy {
    PUBLIC = "public",
    PRIVATE = "private"
}
export declare enum ProductStatus {
    ACTIVE = "active",
    ARCHIEVED = "archived",
    DRAFT = "draft"
}
export declare enum ProductType {
    PHYSICAL = "physical",
    DIGITAL = "digital"
}
export declare enum CollectionTypes {
    MANUAL = "manual",
    AUTOMATED = "automated"
}
export declare enum CollectionConditions {
    All = "all",
    ANY = "any"
}
export declare enum PostPrivacy {
    GUILD_MEMBERS = "guildMembers",
    FOLLOWERS = "followers",
    PUBLIC = "public",
    GROUP = "group",
    PAGE = "page"
}
export declare enum PostType {
    POST = "post",
    FUNDRAISING = "fundraising"
}
export declare enum PostStatus {
    ACTIVE = "active",
    INACTIVE = "inActive"
}
export declare enum MuteInterval {
    WEEK = "week",
    DAY = "day",
    CUSTOM = "custom"
}
export declare enum NotificationType {
    NEW_MESSAGE = "newMessage",
    GROUP_JOIN_REQUEST = "groupJoinRequest",
    GROUP_JOIN_REQUEST_APPROVED = "groupJoinRequestApproved",
    GROUP_JOIN_REQUEST_REJECTED = "groupJoinRequestRejected",
    GROUP_JOINED = "groupJoined",
    POST_LIKED = "postLiked",
    POST_COMMENTED = "postCommented",
    USER_FOLLOWING = "userFollowing",
    USER_SUPPORTING = "userSupporting",
    ORDER_PLACED = "orderPlaced",
    PRODUCT_BOUGHT = "productBought",
    FUNDRAISING_PROJECT_APPROVED = "fundraisingProjectApproved",
    FUNDRAISING_PROJECT_FUNDED = "fundraisingProjectFunded",
    NEW_GROUP_POST = "newGroupPost",
    USER_TAGGED = "userTagged",
    SELLER_REQUEST = "sellerRequest",
    SELLER_REQUEST_APPROVED_REJECTED = "sellerRequestApproveRejected",
    POST_REACTED = "postReacted",
    COMMENT_REACTED = "commentReacted",
    GROUP_INVITATION = "groupInvitation",
    PAGE_INVITATION = "pageInvitation",
    PAGE_JOIN_REQUEST = "pageJoinRequest",
    FRIEND_REQUEST = "friendRequest",
    COMMENT_REPLIED = "commentReplied",
    PAGE_JOIN_REQUEST_APPROVED = "pageJoinRequestApproved",
    PAGE_JOIN_REQUEST_REJECTED = "pageJoinRequestRejected",
    PAGE_FOLLOW_ACCEPTED = "pageFollows",
    PAGE_MODERATOR = "\u2019pageModerator\u2019",
    PAGE_COMMENTED = "pageCommented",
    PAGE_REACTED = "pageReacted"
}
export declare enum ReportType {
    GROUP = "group",
    USER = "user"
}
export declare enum OrderStatus {
    PENDING = "pending",
    DELIVERED = "delivered",
    CANCELED = "canceled",
    CANCEL_REQUESTED = "cancelRequested",
    ACTIVE = "active",
    COMPLETED = "completed"
}
export declare enum SearchFilter {
    ALL = "all",
    PRODUCTS = "products",
    GROUPS = "groups",
    PEOPLE = "prople"
}
export declare enum SearchSort {
    CREATED_AT = "createdAt",
    NAME = "name",
    RATING = "rating",
    DEFAULT = "default"
}
export declare enum Emoji {
    like = "like",
    LOVE = "love",
    LAUGH = "laugh",
    DIS_LIKE = "dislike",
    WOW = "wow",
    SAD = "sad"
}
export declare enum SellerRequest {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum TransectionDuration {
    MONTH = "month",
    WEEK = "week",
    YEAR = "year"
}
export declare enum AGORA_RTC_ROLE {
    PUBLISHER = "publisher",
    AUDIENCE = "audience"
}
export declare enum PostSort {
    MOST_RECENT = "mostRecent",
    RECENT_INTERACTIONS = "recentInteractions"
}
export declare enum GroupInvitationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum FriendRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum BoughtProductsSort {
    TITLE = "title",
    AUTHOR = "author",
    UNREAD = "unread"
}
export declare enum PageFilter {
    ALL = "all",
    POPULAR = "popular",
    SUGGESTED = "suggested",
    LATEST = "latest",
    CREATED = "created",
    MODERATING = "moderating",
    FOLLOWING = "following"
}
export declare enum MediaType {
    VIDEO = "video",
    IMAGE = "image"
}
export declare enum EngagedPostFilter {
    ALL = "all",
    LIKED = "liked",
    COMMENTED = "commented"
}
