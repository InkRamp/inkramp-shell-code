import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  authInterceptor,
  AuthService,
  EventBusService,
  getAuthService,
  getEventBusService,
  configureAuth0,
  APP_CONFIG
} from '@opensourcekd/ng-common-libs';

import { routes } from './app.routes';

/**
 * Initialize Auth0 configuration
 * Runs during Angular's initialization phase
 */
function initializeAuth0() {
  return () => {
    configureAuth0({
      domain: APP_CONFIG.auth0Domain,
      clientId: APP_CONFIG.auth0ClientId,
      audience: APP_CONFIG.apiUrl,
    });
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // Initialize Auth0 configuration during app initialization
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth0,
      multi: true
    },
    // REQUIRED: Use factory functions for singleton behavior across MFEs
    { provide: EventBusService, useFactory: getEventBusService },
    { provide: AuthService, useFactory: getAuthService },
  ]
};
