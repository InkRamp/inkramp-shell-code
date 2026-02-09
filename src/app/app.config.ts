import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
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

// Configure Auth0 before application starts
configureAuth0({
  domain: APP_CONFIG.auth0Domain,
  clientId: APP_CONFIG.auth0ClientId,
  audience: APP_CONFIG.apiUrl,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    // REQUIRED: Use factory functions for singleton behavior across MFEs
    { provide: EventBusService, useFactory: getEventBusService },
    { provide: AuthService, useFactory: getAuthService, deps: [HttpClient, EventBusService] },
  ]
};
