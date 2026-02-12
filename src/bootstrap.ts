import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { authInterceptor } from '@opensourcekd/ng-common-libs';
import { EventBus, TokenManager } from '@opensourcekd/ng-common-libs/core';
import { environment } from './environments/environment';

// Create EventBus instance before bootstrap
const eventBus = new EventBus();

// Create TokenManager instance with configuration
const tokenManager = new TokenManager();
tokenManager.configure({
  tokenKey: 'auth0_access_token',
  refreshTokenKey: 'auth0_refresh_token',
  useSessionStorage: true  // Use sessionStorage for better security
});

// Create APP_CONFIG from environment
export const APP_CONFIG = {
  api: environment.api,
  auth: environment.auth
};

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
      // Provide TokenManager instance
      { provide: TokenManager, useValue: tokenManager },
      // Provide APP_CONFIG
      { provide: 'APP_CONFIG', useValue: APP_CONFIG }
    ],
  });
}
