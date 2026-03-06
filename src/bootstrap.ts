import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, configureAuth0, createAuthService } from '@opensourcekd/ng-common-libs';
import { bearerTokenInterceptor } from '@org/core-services';
import { APP_CONFIG } from './configs/app.config';

// Create EventBus instance before bootstrap with 'shell' identifier
const eventBus = new EventBus({ id: 'shell' });

// Configure Auth0 using the local APP_CONFIG so that credentials are not embedded in
// the public @opensourcekd/ng-common-libs package.
configureAuth0({
  domain: APP_CONFIG.auth0Domain,
  clientId: APP_CONFIG.auth0ClientId,
  audience: APP_CONFIG.apiUrl,
  redirectUri: `${window.location.origin}/i17e`,
  logoutUri: `${window.location.origin}/i17e`,
  scope: 'openid profile email',
});

// Create AuthService using the factory helper; it reads from the AUTH0_CONFIG populated above.
const authService = createAuthService(eventBus);

/**
 * Application bootstrap
 * Bearer token attachment is handled by bearerTokenInterceptor registered via
 * withInterceptors(). The interceptor reads the token synchronously from AuthService
 * and adds an Authorization: Bearer header to every request whose URL begins with
 * APP_CONFIG.apiUrl.
 */
export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(
        withFetch(),
        withInterceptors([bearerTokenInterceptor])
      ),
      // Provide EventBus instance
      { provide: EventBus, useValue: eventBus },
      // Provide AuthService instance
      { provide: AuthService, useValue: authService },
      // Provide local APP_CONFIG
      { provide: 'APP_CONFIG', useValue: APP_CONFIG }
    ],
  });
}
