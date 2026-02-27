import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '@opensourcekd/ng-common-libs';

let isRedirectingToLogin = false;

/**
 * Authentication HTTP interceptor
 * Attaches the Bearer token to outgoing HTTP requests and handles 401 errors.
 *
 * Shared interceptor to be used across all micro-frontends (MFEs).
 * Place in core services and register via withInterceptors() in bootstrap.
 *
 * @example
 * ```typescript
 * // In bootstrap.ts or app.config.ts
 * import { authInterceptor } from '@org/core-services';
 *
 * provideHttpClient(withInterceptors([authInterceptor]))
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  return from(authService.getToken()).pipe(
    switchMap(token => {
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

      return next(authReq).pipe(
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401 && !isRedirectingToLogin) {
            isRedirectingToLogin = true;
            authService.login().catch(loginError => {
              console.error('[authInterceptor] Login redirect failed:', loginError);
              isRedirectingToLogin = false;
            });
          }
          return throwError(() => error);
        })
      );
    })
  );
};
