import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { bearerTokenInterceptor } from '@org/core-services';
import { MessageBridgeService } from './app/services/message-bridge.service';
import { AIBridgeService, AI_BRIDGE_CONFIG } from './app/services/ai-bridge.service';

// Create EventBus instance before bootstrap with 'shell' identifier
const eventBus = new EventBus({ id: 'shell' });

// Create AuthService instance with explicit Auth0 configuration and 'shell' identifier
const authService = new AuthService(
  {
    domain: 'dev-26sow24tone5na8a.us.auth0.com',
    clientId: 'ht41H0hORjG2GlwHQPRD5pknSjKHsmEB',//'21DGfAeeidKC4hw10PDx5HcOu1gZZF1s',
    audience: 'https://inkramp',//'https://something', //APP_CONFIG.apiUrl,
    redirectUri: window.location.href,//window.location.origin,
    logoutUri: window.location.href,//window.location.origin,
    scope: 'openid profile email'
  },
  eventBus,
  undefined, // storageConfig - use defaults
  undefined, // storageKeys - use defaults
  { id: 'shell' } // options - provide id for debugging
);

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
      // Provide APP_CONFIG from InkRamp library
      { provide: 'APP_CONFIG', useValue: APP_CONFIG },
      // AI Bridge configuration — swap trustedOrigin per environment without touching service code
      {
        provide: AI_BRIDGE_CONFIG,
        useValue: { trustedOrigin: 'https://InkRamp.github.io', maxPayloadSize: 64_000 }
      },
      // Register the concrete bridge implementation against the abstract token.
      // Components inject MessageBridgeService — they are decoupled from AIBridgeService.
      { provide: MessageBridgeService, useClass: AIBridgeService }
    ],
  });
}
