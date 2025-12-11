import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
//import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { authInterceptor, EnvironmentLoaderService, updateApiConfig } from '@org/core-services';
import { environment } from './environments/environment';
// import { cacheInterceptor } from '@org/core-services';  // Temporarily disabled - not needed for auth testing
//import { OAuthModule } from 'angular-oauth2-oidc';

export function bootstrap() {
  // Initialize API configuration from environment
  updateApiConfig({
    baseUrl: environment.apiBaseUrl
  });
  
  console.log('[Bootstrap] Environment initialized:', {
    production: environment.production,
    apiBaseUrl: environment.apiBaseUrl
  });

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
