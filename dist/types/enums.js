"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostType = exports.PostPrivacy = exports.CollectionConditions = exports.CollectionTypes = exports.ProductState = exports.ProductTypes = exports.GroupPrivacy = exports.UserStatus = exports.AuthTypes = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "customer";
    UserRole["SELLER"] = "seller";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
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
var ProductTypes;
(function (ProductTypes) {
    ProductTypes["ACTIVE"] = "active";
    ProductTypes["ARCHIEVED"] = "archieved";
    ProductTypes["DRAFT"] = "draft";
})(ProductTypes = exports.ProductTypes || (exports.ProductTypes = {}));
var ProductState;
(function (ProductState) {
    ProductState["PHYSICAL"] = "physical";
    ProductState["DIGITAL"] = "digital";
})(ProductState = exports.ProductState || (exports.ProductState = {}));
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
})(PostPrivacy = exports.PostPrivacy || (exports.PostPrivacy = {}));
var PostType;
(function (PostType) {
    PostType["SIMPLE"] = "simple";
    PostType["FUNDRAISING"] = "fundraising";
})(PostType = exports.PostType || (exports.PostType = {}));
//# sourceMappingURL=enums.js.map