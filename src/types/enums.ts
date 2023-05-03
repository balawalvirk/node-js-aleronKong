export enum UserRoles {
  CUSTOMER = 'customer',
  SELLER = 'seller',
  ADMIN = 'admin',
}

export enum AuthTypes {
  LOCAL = 'local',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export enum UserStatus {
  BLOCKED = 'blocked',
  ACTIVE = 'active',
}

export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum ProductStatus {
  ACTIVE = 'active',
  ARCHIEVED = 'archived',
  DRAFT = 'draft',
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
}

export enum CollectionTypes {
  MANUAL = 'manual',
  AUTOMATED = 'automated',
}

export enum CollectionConditions {
  All = 'all',
  ANY = 'any',
}

export enum PostPrivacy {
  GUILD_MEMBERS = 'guildMembers',
  FOLLOWERS = 'followers',
  PUBLIC = 'public',
  GROUP = 'group',
}

export enum PostType {
  POST = 'post',
  FUNDRAISING = 'fundraising',
}

export enum PostStatus {
  ACTIVE = 'active',
  INACTIVE = 'inActive',
}

export enum MuteInterval {
  WEEK = 'week',
  DAY = 'day',
  CUSTOM = 'custom',
}

export enum NotificationType {
  NEW_MESSAGE = 'newMessage',
  GROUP_JOIN_REQUEST = 'groupJoinRequest',
  GROUP_JOINED = 'groupJoined',
  POST_LIKED = 'postLiked',
  POST_COMMENTED = 'postCommented',
  USER_FOLLOWING = 'userFollowing',
  USER_SUPPORTING = 'userSupporting',
  ORDER_PLACED = 'orderPlaced',
  PRODUCT_BOUGHT = 'productBought',
  FUNDRAISING_PROJECT_APPROVED = 'fundraisingProjectApproved',
  FUNDRAISING_PROJECT_FUNDED = 'fundraisingProjectFunded',
  NEW_GROUP_POST = 'newGroupPost',
  USER_TAGGED = 'userTagged',
  SELLER_REQUEST = 'sellerRequest',
  SELLER_REQUEST_APPROVED_REJECTED = 'sellerRequestApproveRejected',
  POST_REACTED = 'postReacted',
}

export enum ReportType {
  GROUP = 'group',
  USER = 'user',
}

export enum OrderStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
  CANCEL_REQUESTED = 'cancelRequested',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum SearchFilter {
  ALL = 'all',
  PRODUCTS = 'products',
  GROUPS = 'groups',
  PEOPLE = 'prople',
}

export enum SearchSort {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  RATING = 'rating',
  DEFAULT = 'default',
}

export enum Emoji {
  like = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  DIS_LIKE = 'dislike',
  WOW = 'wow',
  SAD = 'sad',
}

export enum SellerRequest {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TransectionDuration {
  MONTH = 'month',
  WEEK = 'week',
  YEAR = 'year',
}

export enum AGORA_RTC_ROLE {
  PUBLISHER = 'publisher',
  AUDIENCE = 'audience',
}

export enum PostSort {
  MOST_RECENT = 'mostRecent',
  RECENT_INTERACTIONS = 'recentInteractions',
}
