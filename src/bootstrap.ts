import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
//import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { cacheInterceptor } from '@org/core-services'; 
//import { OAuthModule } from 'angular-oauth2-oidc';

export function bootstrap() {
  return bootstrapApplication(AppComponent, {
    providers: [
      // provideHttpClient(),
      provideRouter(routes),
      provideHttpClient(
        withFetch(),
        withInterceptors([cacheInterceptor]),
      )
    ],
  });
}
