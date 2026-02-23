import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService, TokenPayload } from '@opensourcekd/ng-common-libs';

/**
 * Extended token payload including the org_and_roles custom claim.
 * Structure: { "hdfc": ["super-admin", "org-admin"], ... }
 */
interface OrgRolesTokenPayload extends TokenPayload {
  org_and_roles?: Record<string, string[]>;
}

/**
 * Extracts all roles from the org_and_roles token claim across all orgs.
 * org_and_roles structure: { "hdfc": ["super-admin", "org-admin"], ... }
 */
function getAllOrgRoles(authService: AuthService): string[] {
  const token = authService.getDecodedToken() as OrgRolesTokenPayload | null;
  if (!token?.org_and_roles) return [];
  return Object.values(token.org_and_roles).flat();
}

/**
 * Route guard to check if the authenticated user has any of the required roles
 * from the org_and_roles claim in the token.
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isAuthenticatedSync()) {
      authService.login().catch(error => {
        console.error('[RoleGuard] Login redirect failed:', error);
      });
      return router.parseUrl('/');
    }
    const userRoles = getAllOrgRoles(authService);
    if (!allowedRoles.some(role => userRoles.includes(role))) {
      console.warn('[RoleGuard] Access denied: insufficient roles', { allowedRoles, userRoles });
      return router.parseUrl('/');
    }
    return true;
  };
}

/**
 * Guard for admin routes (super-admin and org-admin only)
 */
export const adminGuard: CanActivateFn = (route, state) => {
  return roleGuard(['super-admin', 'org-admin'])(route, state);
};

/**
 * Guard for super-admin only routes
 */
export const superAdminGuard: CanActivateFn = (route, state) => {
  return roleGuard(['super-admin'])(route, state);
};

/**
 * Guard for all authenticated users with any valid role
 */
export const allRolesGuard: CanActivateFn = (route, state) => {
  return roleGuard(['super-admin', 'org-admin', 'org-lead', 'sales-executive'])(route, state);
};
