import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { OrgRolesTokenPayload, extractUserRoles } from '../../configs/mfe';

/**
 * Route guard that checks whether the authenticated user holds any of the required roles.
 * Roles are read from the org_and_roles custom claim in the Auth0 token.
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
    const token = authService.getDecodedToken() as OrgRolesTokenPayload | null;
    const userRoles = extractUserRoles(token);
    if (!allowedRoles.some(role => userRoles.includes(role))) {
      console.warn('[RoleGuard] Access denied: insufficient roles', { allowedRoles, userRoles });
      return router.parseUrl('/');
    }
    return true;
  };
}
