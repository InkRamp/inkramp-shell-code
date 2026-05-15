import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { getSessionRole } from '../../configs/mfe';

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
    const role = getSessionRole();
    if (!role || !allowedRoles.map(item => item.toLowerCase()).includes(role)) {
      console.warn('[RoleGuard] Access denied: insufficient role', { allowedRoles, role });
      return router.parseUrl('/');
    }
    return true;
  };
}
