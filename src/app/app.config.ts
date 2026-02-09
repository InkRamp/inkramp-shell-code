import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { 
  AuthService, 
  EventBusService, 
  getAuthService, 
  getEventBusService
} from '@opensourcekd/ng-common-libs';
import { authInterceptor } from '@org/core-services';

import { routes } from './app.routes';

// Note: Auth0 configuration is done in bootstrap.ts before app initialization

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
