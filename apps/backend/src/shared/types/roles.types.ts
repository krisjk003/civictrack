// src/shared/types/roles.types.ts

export enum UserRole {
  CITIZEN = 'citizen',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export const ALL_ROLES: UserRole[] = [
  UserRole.CITIZEN,
  UserRole.ADMIN,
  UserRole.MODERATOR,
];

export const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];

export function isValidRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}