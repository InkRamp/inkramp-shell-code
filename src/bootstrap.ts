import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';

// Create EventBus instance before bootstrap with 'shell' identifier
const eventBus = new EventBus({ id: 'shell' });
console.log('[Shell Bootstrap] EventBus created with id:', eventBus.getId());

// Create AuthService instance with configuration from library's APP_CONFIG and 'shell' identifier
const authService = new AuthService(
  {
    domain: APP_CONFIG.auth0Domain,
    clientId: APP_CONFIG.auth0ClientId,
    redirectUri: window.location.origin + '/auth-callback',
    logoutUri: window.location.origin,
    scope: 'openid profile email'
  },
  eventBus,
  undefined,
  undefined,
  { id: 'shell' }
);
console.log('[Shell Bootstrap] AuthService created with id:', authService.getId());

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
