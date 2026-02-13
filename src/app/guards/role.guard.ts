import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * DEPRECATED: Role-based guards disabled
 * All role-based functionality moved to @opensourcekd/ng-common-libs
 * These guards now allow all access
 */

/**
 * Route guard to check if user has required role
 * @deprecated All guards now allow access - role checking disabled
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    console.warn('[RoleGuard] DEPRECATED: Role checking disabled, allowing all access');
    return true;
  };
}

/**
 * Guard to check if user is admin or team lead
 * @deprecated Allows all access - role checking disabled
 */
export const adminGuard: CanActivateFn = () => {
  console.warn('[adminGuard] DEPRECATED: Allowing all access');
  return true;
};

/**
 * Guard to check if user is admin only
 * @deprecated Allows all access - role checking disabled
 */
export const superAdminGuard: CanActivateFn = () => {
  console.warn('[superAdminGuard] DEPRECATED: Allowing all access');
  return true;
};

/**
 * Guard to check if user has any role (sales executive and above)
 * @deprecated Allows all access - role checking disabled
 */
export const allRolesGuard: CanActivateFn = () => {
  console.warn('[allRolesGuard] DEPRECATED: Allowing all access');
  return true;
};
