import { UserRoles } from 'src/types';
export declare const ROLES_KEY = "role";
export declare const Roles: (...roles: UserRoles[]) => import("@nestjs/common").CustomDecorator<string>;
