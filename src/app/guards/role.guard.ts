import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { extractUserRoles, getSessionRole, OrgRolesTokenPayload } from '../../configs/mfe';

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

    const allowedRoleSet = new Set(allowedRoles.map(role => role.toLowerCase()));
    const token = authService.getDecodedToken() as OrgRolesTokenPayload | null;
    const tokenRoles = extractUserRoles(token);
    const sessionRole = getSessionRole();
    const effectiveRoles = tokenRoles.length ? tokenRoles : (sessionRole ? [sessionRole] : []);

    if (!effectiveRoles.some(role => allowedRoleSet.has(role))) {
      console.warn('[RoleGuard] Access denied: insufficient role', { allowedRoles, effectiveRoles });
      return router.parseUrl('/');
    }

    return true;
  };
}
