import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

/**
 * Authentication HTTP Interceptor
 * Automatically adds authentication token to outgoing API requests
 * Uses functional interceptor pattern (Angular 18+)
 * 
 * This interceptor is shareable and can be used in both Shell and MFE applications.
 * 
 * Usage in app.config.ts:
 * ```typescript
 * import { authInterceptor } from '@org/core-services';
 * 
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideHttpClient(withInterceptors([authInterceptor]))
 *   ]
 * };
 * ```
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getTokenSync();

  // Skip adding token if not authenticated or if request is to auth endpoints
  if (!token || isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Clone request and add authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

/**
 * Pure function to check if URL is an OAuth/Auth0 endpoint that should NOT receive bearer token
 * Note: Our backend API endpoints like /auth/me SHOULD receive the bearer token
 * @param url - Request URL
 * @returns true if URL is an OAuth/Auth0 endpoint (not our API)
 */
const isAuthEndpoint = (url: string): boolean => {
  const authPatterns = [
    '/oauth',
    'auth0.com',
    '/authorize',
    '/token'
  ];
  
  // Our API endpoints should receive the token, so check it's not our API
  const isOurApi = url.includes('execute-api') || url.includes('amazonaws.com');
  if (isOurApi) {
    return false; // Always add token to our API requests
  }
  
  return authPatterns.some(pattern => url.includes(pattern));
};
