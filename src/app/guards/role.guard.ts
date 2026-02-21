import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';

/**
 * Route guard to check if user has required role
 * @param allowedRoles Reserved for future role-based access control; currently only authentication is checked
 * TODO: Implement role-based access control using UserData from AuthService.getUserData()
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    if (!authService.isAuthenticatedSync()) {
      authService.login().catch(error => {
        console.error('[RoleGuard] Login redirect failed:', error);
      });
      return router.parseUrl('/');
    }
    return true;
  };
}

/**
 * Guard to check if user is authenticated (admin or team lead routes)
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticatedSync()) {
    authService.login().catch(error => {
      console.error('[adminGuard] Login redirect failed:', error);
    });
    return router.parseUrl('/');
  }
  return true;
};

/**
 * Guard to check if user is authenticated (super-admin routes)
 */
export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticatedSync()) {
    authService.login().catch(error => {
      console.error('[superAdminGuard] Login redirect failed:', error);
    });
    return router.parseUrl('/');
  }
  return true;
};

/**
 * Guard to check if user is authenticated (all authenticated roles)
 */
export const allRolesGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isAuthenticatedSync()) {
    authService.login().catch(error => {
      console.error('[allRolesGuard] Login redirect failed:', error);
    });
    return router.parseUrl('/');
  }
  return true;
};
