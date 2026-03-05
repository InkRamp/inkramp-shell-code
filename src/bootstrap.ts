import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG, BearerTokenInterceptor } from '@opensourcekd/ng-common-libs';

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
 * Bearer token attachment is handled by BearerTokenInterceptor from @opensourcekd/ng-common-libs
 * which patches window.fetch and XMLHttpRequest at startup.
 * Note: BearerTokenInterceptor only attaches tokens to outgoing requests; 401 error handling
 * (e.g. redirecting to login) should be implemented in the relevant service or component.
 */
export function bootstrap() {
  // Activate the library's singleton fetch/XHR bearer-token interceptor.
  // BearerTokenInterceptor patches window.fetch and XMLHttpRequest so that every
  // request whose URL begins with APP_CONFIG.apiUrl automatically receives an
  // Authorization: Bearer <token> header — no Angular HttpInterceptorFn needed.
  // Placed inside bootstrap() to ensure it is (re-)activated on every bootstrap cycle,
  // including test setups that reset interceptors between runs.
  BearerTokenInterceptor.getInstance('shell', {
    apiUrl: APP_CONFIG.apiUrl,
    getToken: () => authService.getTokenSync(),
  }).activate();

  return bootstrapApplication(AppComponent, {
    providers: [
      provideRouter(routes),
      provideHttpClient(
        withFetch()
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
