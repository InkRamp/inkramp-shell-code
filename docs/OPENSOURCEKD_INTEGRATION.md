# OpenSourceKD Library Integration (v2.0.7)

This document explains how the application consumes the `@opensourcekd/ng-common-libs` library (v2.0.7) with pure TypeScript services.

## Overview

The application uses framework-agnostic services from the opensourcekd library, configured and provided at bootstrap time using the `useValue` pattern.

## Library Version

Current version: **2.0.7**

Key changes from v1.x:
- No more `/core` and `/angular` subpath exports
- All exports available directly from `@opensourcekd/ng-common-libs`
- Includes `AuthService` for Auth0 integration
- Includes `APP_CONFIG` with build-time configuration

## Configuration

### APP_CONFIG from Library

The library provides `APP_CONFIG` with environment-specific values configured at build time:

```typescript
import { APP_CONFIG } from '@opensourcekd/ng-common-libs';

// Available configuration:
APP_CONFIG.auth0Domain    // Auth0 domain
APP_CONFIG.auth0ClientId  // Auth0 client ID
APP_CONFIG.apiUrl         // Backend API URL
```

**Note**: These values are replaced during the library's build process using GitHub repository variables. No local environment files are needed.

### Bootstrap Configuration

Services are instantiated and configured before Angular bootstraps in `src/bootstrap.ts`:

```typescript
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';

// Create EventBus instance
const eventBus = new EventBus();

// Create AuthService instance with library's APP_CONFIG
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

// Provide instances in bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    { provide: EventBus, useValue: eventBus },
    { provide: AuthService, useValue: authService },
    { provide: 'APP_CONFIG', useValue: APP_CONFIG }
  ]
});
```

## Using Provided Services

### Injecting EventBus

```typescript
import { Component, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs';

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

### Injecting AuthService

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from '@opensourcekd/ng-common-libs';

@Component({
  selector: 'app-auth-example',
  template: '...'
})
export class AuthExampleComponent {
  private authService = inject(AuthService);
  
  async login() {
    await this.authService.login();
  }
  
  async checkAuth() {
    if (await this.authService.isAuthenticated()) {
      const user = this.authService.getUser();
      console.log('User:', user);
    }
  }
  
  async logout() {
    await this.authService.logout();
  }
}
```

### Injecting TokenManager

**Note**: TokenManager is no longer provided in v2.0.7. Use AuthService for authentication needs.
```

### Injecting APP_CONFIG

```typescript
import { Component, inject } from '@angular/core';
import { APP_CONFIG } from '@opensourcekd/ng-common-libs';

@Component({
  selector: 'app-config-example',
  template: '...'
})
export class ConfigExampleComponent {
  // Inject APP_CONFIG from library
  private config = inject('APP_CONFIG');
  
  ngOnInit() {
    console.log('API URL:', this.config.apiUrl);
    console.log('Auth0 Domain:', this.config.auth0Domain);
    console.log('Auth0 Client ID:', this.config.auth0ClientId);
  }
}
```

## EventBusService Wrapper

For backward compatibility and convenience, the application provides an Angular service wrapper:

```typescript
import { Injectable, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventBus = inject(EventBus);
  
  // Maintains backward compatibility with both signatures:
  // Old: sendEvent('someString')
  // New: sendEvent('eventType', { data })
  sendEvent(eventTypeOrString: string, data?: any): void {
    if (data === undefined) {
      this.eventBus.emit(eventTypeOrString);
    } else {
      this.eventBus.emit(eventTypeOrString, data);
    }
  }
  
  on<T = any>(eventType: string): Observable<T> {
    return this.eventBus.on<T>(eventType);
  }
  
  onAll(): Observable<any> {
    return this.eventBus.onAll();
  }
}
```

**Note**: The `sendEvent` method maintains backward compatibility with existing code that calls it with a single string parameter.

## Benefits

1. **Framework-Agnostic**: Core services can be reused in non-Angular contexts
2. **Centralized Configuration**: Configuration managed at library build time via GitHub variables
3. **Type Safety**: Full TypeScript support with type definitions
4. **Dependency Injection**: Services are available throughout the application
5. **Testability**: Services can be easily mocked in tests
6. **No Local Config Files**: Eliminates environment file dependencies for microapps

## Migration from v1.x to v2.0.7

### Breaking Changes

1. **No subpath exports**: 
   - Old: `@opensourcekd/ng-common-libs/core`
   - New: `@opensourcekd/ng-common-libs`

2. **AuthService available**: New full-featured Auth0 service included

3. **APP_CONFIG provided**: No need for local environment files

4. **TokenManager removed**: Use AuthService for authentication

### Migration Steps

1. Update imports:
   ```typescript
   // Before
   import { EventBus } from '@opensourcekd/ng-common-libs/core';
   
   // After
   import { EventBus } from '@opensourcekd/ng-common-libs';
   ```

2. Remove local environment files

3. Use APP_CONFIG from library:
   ```typescript
   import { APP_CONFIG } from '@opensourcekd/ng-common-libs';
   ```

4. Update tsconfig.json to remove subpath mappings

## Security Considerations

### APP_CONFIG Values

The APP_CONFIG values are set during the library's build process using GitHub repository variables:
- Not visible in library source code
- Different values per environment
- Managed centrally for all consuming applications

### Token Storage

The AuthService uses configurable storage (sessionStorage by default):
- Tokens are cleared when the browser tab/window is closed
- Tokens are not accessible across tabs
- Reduces risk compared to localStorage

## Migration Notes

- The EventBusService now wraps the opensourcekd EventBus (v2.0.7)
- AuthService replaces custom Auth0 integration
- APP_CONFIG provides centralized access to configuration
- All services use sessionStorage for security
- Backward compatibility is maintained for existing EventBusService calls
- No local environment files reduces dependencies for microapps

