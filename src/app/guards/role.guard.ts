import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RoleService, UserRole } from '@org/core-services';

/**
 * Route guard to check if user has required role
 * @param allowedRoles Array of roles that can access the route
 * @returns CanActivateFn
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    // DEBUG_LOG: Guard checking access
    console.log('[RoleGuard] Checking access for allowed roles:', allowedRoles);

    const currentUser = roleService.getCurrentUser();

    if (!currentUser) {
      // DEBUG_LOG: No user found
      console.warn('[RoleGuard] No user found, redirecting to home');
      router.navigate(['/']);
      return false;
    }

    // DEBUG_LOG: Current user found
    console.log('[RoleGuard] Current user:', currentUser.name, 'Role:', currentUser.role);

    if (!allowedRoles.includes(currentUser.role)) {
      // DEBUG_LOG: User not authorized
      console.warn(`[RoleGuard] User role ${currentUser.role} not allowed, redirecting to home`);
      console.warn('[RoleGuard] Allowed roles:', allowedRoles);
      router.navigate(['/']);
      return false;
    }

    // DEBUG_LOG: Access granted
    console.log('[RoleGuard] Access granted for user:', currentUser.name);
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

/**
 * Guard to check if user has any role (sales executive and above)
 */
export const allRolesGuard: CanActivateFn = roleGuard([
  UserRole.SUPER_ADMIN,
  UserRole.ORG_ADMIN,
  UserRole.TEAM_LEAD,
  UserRole.SALES_EXECUTIVE
]);
