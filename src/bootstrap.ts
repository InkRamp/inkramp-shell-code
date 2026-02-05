import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
//import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { authInterceptor } from '@org/core-services';
// import { cacheInterceptor } from '@org/core-services';  // Temporarily disabled - not needed for auth testing
//import { OAuthModule } from 'angular-oauth2-oidc';
import { configureAuth0 } from '@opensourcekd/ng-common-libs';
import { AUTH0_CONFIG } from './configs/auth.config';

// Configure Auth0 for the library
configureAuth0({
  domain: AUTH0_CONFIG.domain,
  clientId: AUTH0_CONFIG.clientId,
  redirectUri: AUTH0_CONFIG.redirectUri,
  logoutUri: AUTH0_CONFIG.logoutUri,
  audience: AUTH0_CONFIG.audience,
  scope: AUTH0_CONFIG.scope,
  ...(AUTH0_CONFIG.connection && { connection: AUTH0_CONFIG.connection })
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
      )
    ],
  });
}
