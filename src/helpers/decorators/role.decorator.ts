import { SetMetadata } from '@nestjs/common';
import { UserRoles } from 'src/types';

export const ROLES_KEY = 'role';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
