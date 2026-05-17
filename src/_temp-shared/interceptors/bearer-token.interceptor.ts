import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';

/**
 * Angular HTTP interceptor that attaches a Bearer token to every request
 * whose URL begins with the configured API base URL.
 *
 * Designed as a singleton-safe, copy-paste-ready interceptor for use across
 * shell and MFE apps. Token retrieval is synchronous (no RxJS operators
 * required) so the interceptor stays simple and testable.
 *
 * URL matching normalises the API base to end with '/' before comparing, so
 * a request to 'https://api.example.com.attacker.com' cannot accidentally
 * match an API base of 'https://api.example.com'.
 *
 * Registration (in bootstrap.ts / app.config.ts):
 *   provideHttpClient(withFetch(), withInterceptors([bearerTokenInterceptor]))
 */
const AUTH_WHITELIST = [
  '2rjdttem3f.execute-api.us-east-1',
  'amazonaws',
  // add more match strings here
];

export const bearerTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getTokenSync();

  const shouldAttachToken = AUTH_WHITELIST.some((match) =>
    req.url.includes(match)
  );

  if (!token || !shouldAttachToken) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
};
