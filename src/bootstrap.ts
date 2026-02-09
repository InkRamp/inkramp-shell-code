import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
//import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { 
  AuthService, 
  EventBusService, 
  getAuthService, 
  getEventBusService,
  configureAuth0,
  APP_CONFIG
} from '@opensourcekd/ng-common-libs';
import { authInterceptor } from '@org/core-services';
// import { cacheInterceptor } from '@org/core-services';  // Temporarily disabled - not needed for auth testing
//import { OAuthModule } from 'angular-oauth2-oidc';

// Configure Auth0 with values from the library
configureAuth0({
  domain: APP_CONFIG.auth0Domain,
  clientId: APP_CONFIG.auth0ClientId,
  audience: APP_CONFIG.apiUrl,
});

export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      // provideHttpClient(),
      provideRouter(routes),
      provideHttpClient(
        withFetch(),
        withInterceptors([authInterceptor]),
        // withInterceptors([cacheInterceptor]),  // Temporarily disabled
      ),
      // Module Federation singleton providers
      { provide: EventBusService, useFactory: getEventBusService },
      { provide: AuthService, useFactory: getAuthService }
    ],
  });
}
