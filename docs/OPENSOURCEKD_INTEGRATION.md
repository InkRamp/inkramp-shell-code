# OpenSourceKD Library Integration

This document explains how the application consumes the `@opensourcekd/ng-common-libs` library with pure TypeScript services.

## Overview

The application uses framework-agnostic services from the opensourcekd library, configured and provided at bootstrap time using the `useValue` pattern.

## Configuration

### Environment Setup

Environment-specific configuration is centralized in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  
  auth: {
    domain: 'dev-26sow24tone5na8a.us.auth0.com',
    clientId: 'EdkPy5co65jESIAT8T9SBy5X4cmeolhl'
  },
  
  api: {
    baseUrl: 'https://tmzuktmjy7.execute-api.us-east-1.amazonaws.com'
  }
};
```

### Bootstrap Configuration

Services are instantiated and configured before Angular bootstraps in `src/bootstrap.ts`:

```typescript
import { EventBus, TokenManager } from '@opensourcekd/ng-common-libs/core';
import { environment } from './environments/environment';

// Create EventBus instance
const eventBus = new EventBus();

// Create and configure TokenManager
const tokenManager = new TokenManager();
tokenManager.configure({
  tokenKey: 'auth0_access_token',
  refreshTokenKey: 'auth0_refresh_token',
  useSessionStorage: true
});

// Create APP_CONFIG
export const APP_CONFIG = {
  api: environment.api,
  auth: environment.auth
};

// Provide instances in bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    { provide: EventBus, useValue: eventBus },
    { provide: TokenManager, useValue: tokenManager },
    { provide: 'APP_CONFIG', useValue: APP_CONFIG }
  ]
});
```

## Using Provided Services

### Injecting EventBus

```typescript
import { Component, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs/core';

@Component({
  selector: 'app-example',
  template: '...'
})
export class ExampleComponent {
  private eventBus = inject(EventBus);
  
  ngOnInit() {
    // Subscribe to events
    this.eventBus.on('user:login').subscribe(data => {
      console.log('User logged in:', data);
    });
  }
  
  emitEvent() {
    // Emit events
    this.eventBus.emit('user:action', { action: 'clicked' });
  }
}
```

### Injecting TokenManager

```typescript
import { Component, inject } from '@angular/core';
import { TokenManager } from '@opensourcekd/ng-common-libs/core';

@Component({
  selector: 'app-auth-example',
  template: '...'
})
export class AuthExampleComponent {
  private tokenManager = inject(TokenManager);
  
  checkAuth() {
    if (this.tokenManager.isAuthenticated()) {
      const userData = this.tokenManager.getUserFromToken();
      console.log('User data:', userData);
    }
  }
  
  storeToken(token: string) {
    this.tokenManager.setToken(token);
  }
}
```

### Injecting APP_CONFIG

```typescript
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-config-example',
  template: '...'
})
export class ConfigExampleComponent {
  private config = inject('APP_CONFIG');
  
  ngOnInit() {
    console.log('API Base URL:', this.config.api.baseUrl);
    console.log('Auth Domain:', this.config.auth.domain);
  }
}
```

## EventBusService Wrapper

For backward compatibility and convenience, the application provides an Angular service wrapper:

```typescript
import { Injectable, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs/core';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventBus = inject(EventBus);
  
  sendEvent(eventType: string, data?: any): void {
    this.eventBus.emit(eventType, data);
  }
  
  on<T = any>(eventType: string): Observable<T> {
    return this.eventBus.on<T>(eventType);
  }
  
  onAll(): Observable<any> {
    return this.eventBus.onAll();
  }
}
```

## Benefits

1. **Framework-Agnostic**: Core services can be reused in non-Angular contexts
2. **Centralized Configuration**: All configuration happens at bootstrap time
3. **Type Safety**: Full TypeScript support with type definitions
4. **Dependency Injection**: Services are available throughout the application
5. **Testability**: Services can be easily mocked in tests

## Migration Notes

- The EventBusService now wraps the opensourcekd EventBus
- TokenManager replaces custom token management logic
- APP_CONFIG provides centralized access to configuration
- All services use sessionStorage for better security
