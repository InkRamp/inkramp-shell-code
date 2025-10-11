import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService } from '../services/role.service';
import { UserRole } from '../models/roles.model';

/**
 * Route guard to check if user has required role
 * @param allowedRoles Array of roles that can access the route
 * @returns CanActivateFn
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    const currentUser = roleService.getCurrentUser();

    if (!currentUser) {
      console.warn('[RoleGuard] No user found, redirecting to home');
      router.navigate(['/']);
      return false;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      console.warn(`[RoleGuard] User role ${currentUser.role} not allowed, redirecting to home`);
      router.navigate(['/']);
      return false;
    }

    return true;
  };
}

/**
 * Guard to check if user is admin or team lead
 */
export const adminGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.TEAM_LEAD
]);

/**
 * Guard to check if user is admin only
 */
export const superAdminGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN
]);
