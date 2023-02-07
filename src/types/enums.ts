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
  ARCHIEVED = 'archieved',
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
  POST = 'post',
  MESSAGE = 'newMessage',
  USER = 'user',
  ORDER = 'order',
  BOUGHT = 'bought',
  GROUP_JOIN_REQUEST = 'groupJoinRequest',
  GROUP_JOINED = 'groupJoined',
  GROUP_POST = 'groupPost',
  PROJECT_APPROVED = 'projectApproved',
  PROJECT_FUNDED = 'projectFunded',
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
