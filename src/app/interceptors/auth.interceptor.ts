import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@org/core-services';

/**
 * Authentication HTTP Interceptor
 * Automatically adds authentication token to outgoing API requests
 * Uses functional interceptor pattern (Angular 18+)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

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
 * Pure function to check if URL is an auth endpoint
 * @param url - Request URL
 * @returns true if URL is an auth endpoint
 */
const isAuthEndpoint = (url: string): boolean => {
  const authPatterns = [
    '/oauth',
    '/auth',
    'zitadel.cloud'
  ];
  
  return authPatterns.some(pattern => url.includes(pattern));
};
