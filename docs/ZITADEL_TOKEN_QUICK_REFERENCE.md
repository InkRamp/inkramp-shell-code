# Zitadel Token Usage - Quick Reference

> **TL;DR**: Tokens are automatically injected into API requests. Just make HTTP calls normally!

## 🚀 Quick Start for MFE Developers

### 1. Setup (One-time)

```typescript
// In your MFE's app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@org/core-services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])  // This adds token automatically!
    )
  ]
};
```

### 2. Make API Calls (No manual token handling!)

```typescript
// In your component
import { HttpClient } from '@angular/common/http';

export class MyComponent {
  constructor(private http: HttpClient) {}

  loadData() {
    // Token automatically added to headers!
    this.http.get('https://api.example.com/data').subscribe(
      data => console.log('Got data:', data),
      error => {
        if (error.status === 401) {
          console.log('Not authenticated or token expired');
        }
      }
    );
  }
}
```

That's it! You're done. 🎉

---

## 📋 Common Code Snippets

### Check if User is Authenticated

```typescript
import { AuthService } from '@org/core-services';

constructor(private authService: AuthService) {}

ngOnInit() {
  if (!this.authService.isAuthenticated()) {
    console.log('User not logged in');
    return;
  }
  
  this.loadData();
}
```

### Get Current User Information

```typescript
import { AuthService, UserInfo } from '@org/core-services';

export class MyComponent implements OnInit {
  user: UserInfo | null = null;
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    // Get current user
    this.user = this.authService.getUser();
    console.log('User ID:', this.user?.sub);
    console.log('User email:', this.user?.email);
    console.log('User name:', this.user?.name);
    
    // Or subscribe to user changes
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }
}
```

### Get User Role and Permissions

```typescript
import { RoleService, User, UserRole } from '@org/core-services';

export class MyComponent implements OnInit {
  currentUser: User | null = null;
  canEdit: boolean = false;
  
  constructor(private roleService: RoleService) {}
  
  ngOnInit() {
    this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canEdit = this.roleService.hasPermission('edit_rules');
      
      console.log('User role:', user?.role);
      console.log('Can edit:', this.canEdit);
    });
  }
}
```

### Listen to Authentication Events

```typescript
import { EventBusService } from '@org/core-services';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export class MyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor(private eventBus: EventBusService) {}
  
  ngOnInit() {
    this.eventBus.onePlusNEvents
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        try {
          const parsedEvent = JSON.parse(event as string);
          
          if (parsedEvent.type === 'auth:token_updated') {
            console.log('Token refreshed');
            this.onTokenRefresh();
          } else if (parsedEvent.type === 'auth:user_info_updated') {
            console.log('User info updated:', parsedEvent.payload);
            this.onUserUpdate(parsedEvent.payload);
          } else if (parsedEvent.type === 'auth:logout') {
            console.log('User logged out');
            this.onLogout();
          }
        } catch (e) {
          // Not a JSON auth event
        }
      });
  }
  
  onTokenRefresh() {
    // Optionally refresh data
    this.loadData();
  }
  
  onUserUpdate(userInfo: any) {
    // Update local state
  }
  
  onLogout() {
    // Clear local data
    this.data = [];
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Handle API Errors

```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

loadData() {
  this.http.get('/api/data')
    .pipe(
      retry(2),  // Retry up to 2 times
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - token expired or invalid
          console.error('Authentication failed');
          this.authService.logout();
          // Shell will redirect to login
        } else if (error.status === 403) {
          // Forbidden - user lacks permission
          console.error('Access denied');
          this.showErrorMessage('You do not have permission to access this data');
        } else if (error.status === 0) {
          // Network error
          console.error('Network error or CORS issue');
          this.showErrorMessage('Unable to connect to server');
        } else {
          console.error('API error:', error);
        }
        return throwError(() => error);
      })
    )
    .subscribe(
      data => this.data = data,
      error => console.log('Error handled:', error)
    );
}
```

### Make POST/PUT/DELETE Requests

```typescript
// POST - Create new resource
createItem(item: any) {
  this.http.post('/api/items', item).subscribe(
    created => console.log('Created:', created),
    error => console.error('Create failed:', error)
  );
}

// PUT - Update existing resource
updateItem(id: string, updates: any) {
  this.http.put(`/api/items/${id}`, updates).subscribe(
    updated => console.log('Updated:', updated),
    error => console.error('Update failed:', error)
  );
}

// DELETE - Remove resource
deleteItem(id: string) {
  this.http.delete(`/api/items/${id}`).subscribe(
    () => console.log('Deleted successfully'),
    error => console.error('Delete failed:', error)
  );
}
```

### Add Custom Headers to Specific Requests

```typescript
loadDataWithCustomHeaders() {
  const headers = {
    'X-Custom-Header': 'my-value',
    'X-Request-ID': this.generateRequestId()
  };
  
  // Token still added automatically by authInterceptor!
  this.http.get('/api/data', { headers }).subscribe(
    data => console.log('Data:', data)
  );
}

generateRequestId(): string {
  return `req-${Date.now()}-${Math.random()}`;
}
```

### Development Mode Without Backend

```typescript
import { environment } from '../environments/environment';

ngOnInit() {
  if (!environment.production) {
    this.useDevMode();
  } else {
    this.loadRealData();
  }
}

useDevMode() {
  // Set dev user
  const devUser = {
    sub: 'dev-user-123',
    name: 'Dev User',
    email: 'dev@example.com'
  };
  this.roleService.setDevMimicUser({
    id: devUser.sub,
    name: devUser.name,
    email: devUser.email,
    role: UserRole.SUPER_ADMIN
  });
  
  // Use mock data
  this.data = [
    { id: 1, name: 'Mock Item 1' },
    { id: 2, name: 'Mock Item 2' }
  ];
}

loadRealData() {
  if (!this.authService.isAuthenticated()) {
    console.log('Not authenticated');
    return;
  }
  
  this.http.get('/api/data').subscribe(
    data => this.data = data
  );
}
```

---

## 🔍 Debugging Checklist

### Not Getting Token?

1. **Check authentication status:**
   ```typescript
   console.log('Authenticated?', this.authService.isAuthenticated());
   console.log('Token:', this.authService.getToken());
   console.log('User:', this.authService.getUser());
   ```

2. **Check sessionStorage:**
   - Open DevTools → Application → Session Storage
   - Look for: `zitadel_token` and `zitadel_user_info`

3. **Check interceptor registration:**
   ```typescript
   // Verify this is in your app.config.ts
   provideHttpClient(withInterceptors([authInterceptor]))
   ```

### Getting 401 Errors?

1. **Check token expiration:**
   ```typescript
   const token = sessionStorage.getItem('zitadel_token');
   if (token) {
     const payload = JSON.parse(atob(token.split('.')[1]));
     console.log('Expires:', new Date(payload.exp * 1000));
     console.log('Now:', new Date());
     console.log('Expired?', Date.now() >= payload.exp * 1000);
   }
   ```

2. **Check request headers:**
   - Open DevTools → Network tab
   - Click on your API request
   - Look for `Authorization: Bearer ...` in Request Headers

3. **Check API CORS:**
   - Look for CORS errors in console
   - API must allow your origin and Authorization header

### Token Not Shared Between MFEs?

1. **Check webpack config:**
   ```javascript
   // In EACH MFE's webpack.config.js
   shared: {
     '@org/core-services': {
       singleton: true,  // Must be true!
       strictVersion: true,
       requiredVersion: 'auto'
     }
   }
   ```

2. **Check import path:**
   ```typescript
   // ✅ Correct
   import { AuthService } from '@org/core-services';
   
   // ❌ Wrong (creates new instance)
   import { AuthService } from '../../../core-services/lib/auth.service';
   ```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         BROWSER                              │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    SHELL APP                           │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  AuthService (core-services)                     │ │ │
│  │  │  - Handles Zitadel OAuth2 flow                   │ │ │
│  │  │  - Stores token in sessionStorage                │ │ │
│  │  │  - Emits auth events via EventBus                │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  authInterceptor                                 │ │ │
│  │  │  - Automatically adds "Authorization: Bearer"    │ │ │
│  │  │  - Applied to ALL HTTP requests                  │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                         │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐               │ │
│  │  │  MFE 1  │  │  MFE 2  │  │  MFE 3  │               │ │
│  │  │         │  │         │  │         │               │ │
│  │  │  Uses:  │  │  Uses:  │  │  Uses:  │               │ │
│  │  │  - Same │  │  - Same │  │  - Same │               │ │
│  │  │    Auth │  │    Auth │  │    Auth │               │ │
│  │  │  - Same │  │  - Same │  │  - Same │               │ │
│  │  │    Token│  │    Token│  │    Token│               │ │
│  │  └─────────┘  └─────────┘  └─────────┘               │ │
│  │      │            │            │                       │ │
│  │      └────────────┴────────────┘                       │ │
│  │                   │                                     │ │
│  │         All use HttpClient with                        │ │
│  │         authInterceptor → Token added automatically    │ │
│  └────────────────────────────────────────────────────────┘ │
│                     │                                        │
│          HTTP GET /api/data                                 │
│          Headers: {                                         │
│            Authorization: "Bearer eyJhbGc..."               │
│          }                                                  │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   API Server │
              │              │
              │ 1. Validate  │
              │    token     │
              │ 2. Extract   │
              │    user ID   │
              │ 3. Query DB  │
              │ 4. Return    │
              │    data      │
              └──────────────┘
```

---

## 🔐 Security Checklist

- ✅ Tokens stored in sessionStorage (not localStorage)
- ✅ CSRF protection via state parameter
- ✅ Token automatically added to API requests
- ✅ API validates token signature with Zitadel
- ⚠️ **TODO:** Implement token expiration checking
- ⚠️ **TODO:** Implement automatic token refresh
- ⚠️ **TODO:** Add Content Security Policy headers
- ⚠️ **TODO:** Implement token refresh 5 min before expiry

---

## 📝 MFE Checklist

When creating a new MFE, ensure:

- [ ] Install `@org/core-services` package
- [ ] Import and register `authInterceptor` in app.config.ts
- [ ] Configure webpack to share `@org/core-services` as singleton
- [ ] Import services from `@org/core-services` (not relative paths)
- [ ] Handle 401 errors gracefully
- [ ] Subscribe to auth events if needed
- [ ] Test in both authenticated and unauthenticated states
- [ ] Test in both standalone and federated modes
- [ ] Check token is added to API requests (DevTools → Network)
- [ ] Verify CORS is configured on API

---

## 🎯 Key Takeaways

1. **Tokens are automatic** - No manual handling needed in 99% of cases
2. **Just use HttpClient** - Token added by interceptor
3. **Shared singleton** - All MFEs use same AuthService instance
4. **sessionStorage** - Token persists across page refreshes (same tab)
5. **EventBus** - Listen to auth events if you need to react to changes
6. **Handle 401** - Check for authentication errors in HTTP calls
7. **Dev mode** - Use dev mimic user for local development

---

## 🆘 Getting Help

1. **Check sessionStorage:**
   - DevTools → Application → Session Storage → `zitadel_token`

2. **Check Network tab:**
   - DevTools → Network → Your API call → Headers
   - Look for `Authorization: Bearer ...`

3. **Check Console:**
   - Look for `[AuthService]` logs
   - Look for `[EventBusService]` logs

4. **Still stuck?**
   - Read full guide: `docs/ZITADEL_TOKEN_USAGE_IN_MFES.md`
   - Check Zitadel integration: `ZITADEL_INTEGRATION.md`
   - Review API integration: `docs/API_INTEGRATION_GUIDE.md`

---

## 📚 Related Documentation

- [Complete Token Usage Guide](./ZITADEL_TOKEN_USAGE_IN_MFES.md) - Deep dive into architecture
- [Zitadel Integration](../ZITADEL_INTEGRATION.md) - OAuth2 setup and configuration
- [API Integration Guide](./API_INTEGRATION_GUIDE.md) - Using API services
- [MFE Development Guide](./MFE_DEVELOPMENT_GUIDE.md) - Creating new MFEs
- [Developer Guide](./DEVELOPER_GUIDE.md) - General development practices

---

**Last Updated:** 2025-11-04
