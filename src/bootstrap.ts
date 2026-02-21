import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG, configureAuth0, createAuthService } from '@opensourcekd/ng-common-libs';

// Configure Auth0 using app-level settings
configureAuth0({
  domain: APP_CONFIG.auth0Domain,
  clientId: APP_CONFIG.auth0ClientId,
  audience: APP_CONFIG.apiUrl,
  redirectUri: `${window.location.origin}/i17e`,
  logoutUri: `${window.location.origin}/i17e`,
  scope: 'openid profile email'
});

// Create EventBus instance before bootstrap with 'shell' identifier
const eventBus = new EventBus({ id: 'shell' });

// Create AuthService using the library helper, pre-configured via configureAuth0()
const authService = createAuthService(eventBus);

/**
 * Application bootstrap
 * NOTE: Auth interceptor disabled - configure separately if needed
 */
export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(
        withFetch()
        // NOTE: Auth interceptor removed - configure via opensourcekd library if needed
      ),
      // Provide EventBus instance
      { provide: EventBus, useValue: eventBus },
      // Provide AuthService instance
      { provide: AuthService, useValue: authService },
      // Provide APP_CONFIG from opensourcekd library
      { provide: 'APP_CONFIG', useValue: APP_CONFIG }
    ],
  });
}
