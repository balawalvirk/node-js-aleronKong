export enum UserRole {
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

export enum ProductTypes {
  ACTIVE = 'active',
  ARCHIEVED = 'archieved',
  DRAFT = 'draft',
}

export enum ProductState {
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
