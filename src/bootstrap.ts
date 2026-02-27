import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { authInterceptor } from '@org/core-services';

// Create EventBus instance before bootstrap with 'shell' identifier
const eventBus = new EventBus({ id: 'shell' });

// Create AuthService instance with configuration from library's APP_CONFIG and 'shell' identifier
console.log("Hey JOJO", APP_CONFIG)
const authService = new AuthService(
  {
    domain: APP_CONFIG.auth0Domain,
    clientId: APP_CONFIG.auth0ClientId,
    audience: 'https://something', //APP_CONFIG.apiUrl,
    redirectUri: `${window.location.origin}/i17e`,
    logoutUri: `${window.location.origin}/i17e`,
    scope: 'openid profile email'
  },
  eventBus,
  undefined, // storageConfig - use defaults
  undefined, // storageKeys - use defaults
  { id: 'shell' } // options - provide id for debugging
);

/**
 * Application bootstrap
 * Auth interceptor registered via withInterceptors([authInterceptor])
 */
export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(
        withFetch(),
        withInterceptors([authInterceptor])
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
