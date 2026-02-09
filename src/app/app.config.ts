import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  AuthService, 
  EventBusService, 
  getAuthService, 
  getEventBusService,
  configureAuth0,
  APP_CONFIG
} from '@opensourcekd/ng-common-libs';
import { authInterceptor } from '@org/core-services';

import { routes } from './app.routes';

// Configure Auth0 with values from the library
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
    // Module Federation singleton providers
    { provide: EventBusService, useFactory: getEventBusService },
    { provide: AuthService, useFactory: getAuthService }
  ]
};
