import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
// import { authInterceptor } from '@opensourcekd/ng-common-libs';  // Commented out for now - not required
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { authInterceptor } from '@org/core-services';

// Create EventBus instance before bootstrap
const eventBus = new EventBus();

// Create AuthService instance with configuration from library's APP_CONFIG
const authService = new AuthService(
  {
    domain: APP_CONFIG.auth0Domain,
    clientId: APP_CONFIG.auth0ClientId,
    redirectUri: window.location.origin + '/auth-callback',
    logoutUri: window.location.origin,
    scope: 'openid profile email'
  },
  eventBus
);

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
