# Zitadel Token Usage in MFEs - Complete Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [How Zitadel Tokens Work](#how-zitadel-tokens-work)
3. [Token Flow Across Systems](#token-flow-across-systems)
4. [How MFEs Access Tokens](#how-mfes-access-tokens)
5. [Implementation Patterns](#implementation-patterns)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Common Scenarios](#common-scenarios)

---

## Architecture Overview

Your system has a **distributed architecture** with separate systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    SHELL (i17e)                           │   │
│  │  - Zitadel Integration (AuthService)                      │   │
│  │  - Token Storage (sessionStorage)                         │   │
│  │  - Core Services (@org/core-services)                     │   │
│  │  - EventBus for cross-MFE communication                   │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │ MFE-1    │  │ MFE-2    │  │ MFE-3    │               │   │
│  │  │ Rules    │  │ Sales    │  │ Reports  │               │   │
│  │  │ Module   │  │ Module   │  │ Module   │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
           │                                         │
           │ OAuth2                                  │ HTTP + Bearer Token
           │ Login/Callback                          │
           ▼                                         ▼
    ┌─────────────┐                          ┌─────────────┐
    │   ZITADEL   │                          │   API       │
    │   (OAuth2   │                          │  (Backend)  │
    │   Provider) │                          └─────────────┘
    └─────────────┘                                 │
                                                    ▼
                                             ┌─────────────┐
                                             │  DATABASE   │
                                             └─────────────┘
```

### Key Points:
- **Shell**: Main host application that integrates with Zitadel and loads MFEs
- **Zitadel**: External OAuth2 authentication provider (separate system)
- **API**: Backend service that validates tokens and serves data (separate system)
- **Database**: Data storage (separate system)
- **MFEs**: Micro frontends loaded dynamically via Module Federation (separate builds)

---

## How Zitadel Tokens Work

### 1. OAuth2 Flow (PKCE)

When a user logs in, the following happens:

```typescript
// User clicks "Login" in Shell
AuthService.login() 
  ↓
// Redirect to Zitadel authorization endpoint
window.location.href = "https://topfix-wrczmn.us1.zitadel.cloud/oauth/v2/authorize?..."
  ↓
// User authenticates with Zitadel
[Zitadel Login Screen]
  ↓
// Zitadel redirects back with authorization code
window.location.href = "https://opensourcekd.github.io/i17e/auth-callback?code=...&state=..."
  ↓
// Shell exchanges code for tokens
AuthService.handleCallback(code, state)
  ↓
// Tokens received
{
  access_token: "eyJhbGc...",  // JWT token for API calls
  id_token: "eyJhbGc...",      // JWT with user info
  token_type: "Bearer",
  expires_in: 3600
}
  ↓
// Store in sessionStorage
sessionStorage.setItem('zitadel_token', access_token)
sessionStorage.setItem('zitadel_user_info', JSON.stringify(userInfo))
  ↓
// Emit event for MFEs
EventBus.sendEvent('auth:token_updated', { token })
EventBus.sendEvent('auth:user_info_updated', userInfo)
```

### 2. Token Storage Strategy

**Current Implementation: sessionStorage**

```typescript
// In AuthService (core-services library)
private readonly TOKEN_KEY = 'zitadel_token';
private readonly USER_INFO_KEY = 'zitadel_user_info';

setToken(token: string): void {
  sessionStorage.setItem(this.TOKEN_KEY, token);
  this.emitAuthEvent('token_updated', { token });
}

getToken(): string | null {
  return sessionStorage.getItem(this.TOKEN_KEY);
}
```

**Why sessionStorage?**
- ✅ More secure than localStorage (cleared on tab close)
- ✅ Not sent automatically with requests (like cookies)
- ✅ Prevents CSRF attacks
- ✅ Suitable for SPA architecture
- ⚠️ User must re-authenticate on new tab/window

---

## Token Flow Across Systems

### Complete Authentication & API Call Flow

```
1. USER ACTION: Click Login
   ↓
2. SHELL: Redirect to Zitadel
   ↓
3. ZITADEL: User authenticates
   ↓
4. ZITADEL: Redirect back with code
   ↓
5. SHELL: Exchange code for tokens
   ↓
6. SHELL: Store token in sessionStorage
   ↓
7. SHELL: Emit auth events via EventBus
   ↓
8. MFE: Listen to auth events and update local state
   ↓
9. MFE: Make API call (e.g., fetch sales data)
   ↓
10. INTERCEPTOR: Automatically add "Authorization: Bearer {token}" header
   ↓
11. API: Validate token with Zitadel
   ↓
12. API: Extract user identity from token
   ↓
13. DATABASE: Query data based on user permissions
   ↓
14. API: Return data to MFE
   ↓
15. MFE: Display data to user
```

### Token Validation on API Side

```
API receives request with header:
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

API validates token:
1. Decode JWT
2. Verify signature using Zitadel's public key (JWKS endpoint)
3. Check expiration (exp claim)
4. Check issuer (iss claim) matches Zitadel
5. Check audience (aud claim) if configured
6. Extract user ID (sub claim) and permissions

If valid:
  → Process request with user context
  → Query DB with user permissions applied
  → Return filtered data

If invalid:
  → Return 401 Unauthorized
  → MFE should redirect to login
```

---

## How MFEs Access Tokens

MFEs have **THREE main patterns** to access and use Zitadel tokens:

### Pattern 1: Automatic Token Injection (Recommended)

**The authInterceptor automatically adds tokens to ALL API requests.**

```typescript
// In Shell's app.config.ts (already configured)
import { authInterceptor } from '@org/core-services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

**How it works:**

```typescript
// In authInterceptor (core-services/lib/interceptors/auth.interceptor.ts)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Skip auth endpoints
  if (!token || isAuthEndpoint(req.url)) {
    return next(req);
  }

  // Clone request and add Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
```

**MFE Usage (automatic):**

```typescript
// In MFE component - NO manual token handling needed!
import { HttpClient } from '@angular/common/http';

export class SalesComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Token is AUTOMATICALLY added by interceptor
    this.http.get('https://api.example.com/sales').subscribe(data => {
      console.log('Sales data:', data);
    });
  }
}
```

### Pattern 2: Listen to Auth Events

**MFEs can listen to authentication events to update their state.**

```typescript
// In MFE component
import { EventBusService } from '@org/core-services';

export class MfeComponent implements OnInit {
  private destroy$ = new Subject<void>();
  
  constructor(private eventBus: EventBusService) {}

  ngOnInit() {
    // Subscribe to ALL authentication events
    this.eventBus.onePlusNEvents
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        try {
          const parsedEvent = JSON.parse(event as string);
          
          switch(parsedEvent.type) {
            case 'auth:token_updated':
              console.log('New token available:', parsedEvent.payload.token);
              this.handleTokenUpdate(parsedEvent.payload);
              break;
              
            case 'auth:user_info_updated':
              console.log('User info updated:', parsedEvent.payload);
              this.handleUserInfoUpdate(parsedEvent.payload);
              break;
              
            case 'auth:logout':
              console.log('User logged out');
              this.handleLogout();
              break;
          }
        } catch (e) {
          // Not a JSON auth event, ignore
        }
      });
  }

  handleTokenUpdate(payload: any) {
    // Token refreshed - no action needed if using interceptor
    // But you could trigger data refresh here
    this.refreshData();
  }

  handleUserInfoUpdate(userInfo: UserInfo) {
    // Update local user state
    this.currentUser = userInfo;
    this.loadUserSpecificData();
  }

  handleLogout() {
    // Clear local state
    this.currentUser = null;
    this.clearData();
    // Optionally redirect to login
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Pattern 3: Direct Access via AuthService

**MFEs can directly import and use AuthService from core-services.**

```typescript
// In MFE component
import { AuthService, UserInfo } from '@org/core-services';

export class MfeComponent implements OnInit {
  token: string | null = null;
  user: UserInfo | null = null;
  isAuthenticated: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check authentication status
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Get current token
    this.token = this.authService.getToken();
    
    // Subscribe to user changes
    this.authService.user$.subscribe(user => {
      this.user = user;
      console.log('Current user:', user);
    });
    
    // Manual API call with token (not recommended - use Pattern 1)
    if (this.token) {
      this.http.get('https://api.example.com/data', {
        headers: { Authorization: `Bearer ${this.token}` }
      }).subscribe(data => {
        console.log('Data:', data);
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
```

---

## Implementation Patterns

### Pattern A: Standalone MFE (Can Run Independently)

For MFEs that can run without the Shell (for development/testing):

```typescript
// In MFE app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@org/core-services';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])  // Still works in standalone mode!
    )
  ]
};

// In MFE main component
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check if running in Shell or standalone
    const isStandalone = !window['shellApp'];
    
    if (isStandalone) {
      // Handle authentication locally
      if (!this.authService.isAuthenticated()) {
        console.log('Not authenticated in standalone mode');
        // Could redirect to login or use dev mode
        this.useDevMode();
      }
    } else {
      // Running in Shell - tokens managed by Shell
      console.log('Running in Shell, tokens managed centrally');
    }
  }

  useDevMode() {
    // For local development without authentication
    const devUser = {
      sub: 'dev-user-123',
      name: 'Dev User',
      email: 'dev@example.com'
    };
    // Use dev mimic user (see below)
  }
}
```

### Pattern B: Federated MFE (Always Runs in Shell)

For MFEs that always run within the Shell:

```typescript
// In MFE - simpler implementation
export class FederatedMfeComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private roleService: RoleService  // From Shell via core-services
  ) {}

  ngOnInit() {
    // Assume authentication is handled by Shell
    // Just make API calls - tokens added automatically
    this.loadData();
  }

  loadData() {
    // No manual token handling needed!
    this.http.get<any[]>('/api/data').subscribe(
      data => console.log('Data:', data),
      error => {
        if (error.status === 401) {
          console.error('Unauthorized - token may be expired');
          // Shell will handle re-authentication
        }
      }
    );
  }
}
```

### Pattern C: Multi-MFE Page

When multiple MFEs are loaded on the same page:

```typescript
// In Shell - load multiple MFEs
<app-mfe-wrapper [names]="['my-sales', 'my-report']"></app-mfe-wrapper>

// All MFEs share the SAME:
// - sessionStorage (same tab)
// - AuthService instance (singleton)
// - Token (automatically injected)
// - EventBus (shared communication)

// When token is updated in one MFE:
authService.setToken(newToken);
// → Stored in sessionStorage
// → Event emitted via EventBus
// → ALL MFEs on page are notified
// → All subsequent API calls use new token
```

---

## Security Best Practices

### 1. Token Expiration Handling

**Current Status:** Basic token storage, no expiration checking

**Recommended Implementation:**

```typescript
// Enhance AuthService with token expiration
interface TokenData {
  token: string;
  expiresAt: number;  // Unix timestamp
  refreshToken?: string;
}

setToken(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + (expiresIn * 1000);
  const tokenData: TokenData = { token, expiresAt };
  sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
}

getToken(): string | null {
  const data = sessionStorage.getItem(this.TOKEN_KEY);
  if (!data) return null;
  
  const tokenData: TokenData = JSON.parse(data);
  
  // Check if expired
  if (Date.now() >= tokenData.expiresAt) {
    console.log('Token expired');
    this.logout();
    return null;
  }
  
  return tokenData.token;
}

// Auto-refresh before expiration
startTokenRefreshTimer() {
  const tokenData = this.getTokenData();
  if (!tokenData) return;
  
  const expiresIn = tokenData.expiresAt - Date.now();
  const refreshAt = expiresIn - (5 * 60 * 1000); // 5 minutes before expiry
  
  setTimeout(() => {
    this.refreshToken();
  }, refreshAt);
}
```

### 2. Token Refresh Strategy

**Option A: Silent Refresh (Recommended)**

```typescript
async refreshToken(): Promise<boolean> {
  try {
    // Use iframe to silently re-authenticate
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = `${this.ISSUER_BASE_URL}/oauth/v2/authorize?prompt=none&...`;
    
    // Wait for callback with new token
    // Implement postMessage communication
    
    return true;
  } catch (error) {
    console.error('Silent refresh failed:', error);
    this.logout(); // Force re-login
    return false;
  }
}
```

**Option B: Refresh Token Grant**

```typescript
async refreshTokenWithGrant(): Promise<boolean> {
  const refreshToken = this.getRefreshToken();
  if (!refreshToken) return false;
  
  try {
    const response = await fetch(`${this.ISSUER_BASE_URL}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.CLIENT_ID
      })
    });
    
    const tokens = await response.json();
    this.setToken(tokens.access_token, tokens.expires_in);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}
```

### 3. Secure Token Storage

**Current:** sessionStorage (good)

**Enhanced:** Encrypted storage (optional, for sensitive data)

```typescript
// Using Web Crypto API for encryption (advanced)
class SecureStorage {
  private key: CryptoKey | null = null;
  
  async init() {
    // Generate encryption key (store in memory only)
    this.key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,  // not extractable
      ['encrypt', 'decrypt']
    );
  }
  
  async setItem(key: string, value: string): Promise<void> {
    const encrypted = await this.encrypt(value);
    sessionStorage.setItem(key, encrypted);
  }
  
  async getItem(key: string): Promise<string | null> {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }
  
  private async encrypt(text: string): Promise<string> {
    // Implementation details...
  }
  
  private async decrypt(ciphertext: string): Promise<string> {
    // Implementation details...
  }
}
```

### 4. CSRF Protection

**Already Implemented:** State parameter in OAuth flow

```typescript
// In AuthService.redirectToZitadelLogin()
const state = this.generateRandomState();
sessionStorage.setItem('oauth_state', state);

// In AuthService.handleCallback()
if (state !== storedState) {
  console.error('State mismatch - possible CSRF attack');
  return false;
}
```

### 5. XSS Protection

**Best Practices:**

```typescript
// ✅ DO: Use Angular's built-in sanitization
<div [innerHTML]="sanitizer.sanitize(SecurityContext.HTML, userContent)"></div>

// ✅ DO: Never store sensitive data in localStorage
// sessionStorage is cleared on tab close

// ✅ DO: Use Content Security Policy (CSP)
// In index.html:
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://api.example.com https://topfix-wrczmn.us1.zitadel.cloud">

// ❌ DON'T: Use eval() or innerHTML with user data
// ❌ DON'T: Store tokens in cookies without HttpOnly flag
// ❌ DON'T: Expose tokens in URLs or logs
```

---

## Troubleshooting

### Issue 1: MFE Not Getting Token

**Symptoms:**
- MFE makes API call but gets 401 Unauthorized
- `authService.getToken()` returns null
- Headers don't include Authorization

**Diagnosis:**

```typescript
// In MFE component
ngOnInit() {
  console.log('Is authenticated?', this.authService.isAuthenticated());
  console.log('Token:', this.authService.getToken());
  console.log('User:', this.authService.getUser());
  console.log('SessionStorage token:', sessionStorage.getItem('zitadel_token'));
}
```

**Solutions:**

1. **Check if user is logged in:**
   ```typescript
   if (!this.authService.isAuthenticated()) {
     console.log('User not authenticated, redirecting to login');
     this.authService.login();
   }
   ```

2. **Check interceptor is registered:**
   ```typescript
   // In MFE's app.config.ts - verify this exists:
   provideHttpClient(withInterceptors([authInterceptor]))
   ```

3. **Check token in storage:**
   ```typescript
   // Open browser DevTools → Application → Session Storage
   // Look for: zitadel_token and zitadel_user_info
   ```

4. **Check if token expired:**
   ```typescript
   const token = sessionStorage.getItem('zitadel_token');
   if (token) {
     const decoded = JSON.parse(atob(token.split('.')[1]));
     console.log('Token expires:', new Date(decoded.exp * 1000));
     console.log('Current time:', new Date());
   }
   ```

### Issue 2: Token Not Shared Across MFEs

**Symptoms:**
- One MFE has token, another doesn't
- Inconsistent authentication state

**Diagnosis:**

```typescript
// In both MFEs
console.log('AuthService instance:', this.authService.id);
console.log('Is singleton?', this.authService === injector.get(AuthService));
```

**Solutions:**

1. **Ensure core-services is shared singleton:**
   ```javascript
   // In webpack.config.js of EACH MFE
   shared: {
     '@org/core-services': {
       singleton: true,
       strictVersion: true,
       requiredVersion: 'auto'
     }
   }
   ```

2. **Verify all MFEs import from same package:**
   ```typescript
   // ✅ Correct
   import { AuthService } from '@org/core-services';
   
   // ❌ Wrong
   import { AuthService } from '../../../core-services/src/lib/auth.service';
   ```

### Issue 3: API Returns 401 Despite Valid Token

**Symptoms:**
- Token exists in sessionStorage
- Header is added to request
- API still returns 401 Unauthorized

**Diagnosis:**

```typescript
// Check actual headers sent
this.http.get('/api/data').subscribe(
  data => console.log(data),
  error => {
    console.log('Error status:', error.status);
    console.log('Error headers:', error.headers);
    
    // Check if token was actually sent
    // Use browser DevTools → Network → Request Headers
  }
);
```

**Solutions:**

1. **Token may be expired:**
   ```typescript
   // Decode and check expiration
   const token = this.authService.getToken();
   const payload = JSON.parse(atob(token.split('.')[1]));
   if (Date.now() >= payload.exp * 1000) {
     console.log('Token expired!');
     this.authService.logout();
     this.authService.login();
   }
   ```

2. **API may not recognize token format:**
   ```typescript
   // Check token format sent to API
   // Should be: Authorization: Bearer eyJhbGc...
   
   // Verify interceptor is adding "Bearer" prefix
   ```

3. **API may be validating against wrong Zitadel instance:**
   ```typescript
   // Verify API is configured with correct Zitadel JWKS endpoint:
   // https://topfix-wrczmn.us1.zitadel.cloud/.well-known/openid-configuration
   ```

4. **CORS issues:**
   ```typescript
   // Check browser console for CORS errors
   // API must include CORS headers:
   Access-Control-Allow-Origin: https://opensourcekd.github.io
   Access-Control-Allow-Headers: Authorization, Content-Type
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   ```

### Issue 4: Token Lost on Page Refresh

**Symptoms:**
- User authenticated, but token gone after refresh
- Must re-login after every page reload

**Diagnosis:**

```typescript
// Check if token is in sessionStorage
console.log('Token in sessionStorage:', sessionStorage.getItem('zitadel_token'));

// Check if localStorage is being used instead
console.log('Token in localStorage:', localStorage.getItem('zitadel_token'));
```

**Solutions:**

1. **sessionStorage persists during session:**
   - ✅ Refreshing same tab → token preserved
   - ❌ New tab/window → token lost (by design)
   - ❌ Closing tab → token lost (by design)

2. **If you need persistence across tabs:**
   ```typescript
   // Option A: Use localStorage instead (less secure)
   localStorage.setItem(this.TOKEN_KEY, token);
   
   // Option B: Implement tab synchronization
   window.addEventListener('storage', (e) => {
     if (e.key === 'zitadel_token') {
       // Token updated in another tab
       this.syncTokenFromStorage();
     }
   });
   ```

3. **Implement "Remember Me" functionality:**
   ```typescript
   login(rememberMe: boolean = false) {
     if (rememberMe) {
       // Use localStorage for long-term storage
       this.storage = localStorage;
     } else {
       // Use sessionStorage for session-only
       this.storage = sessionStorage;
     }
     this.redirectToZitadelLogin();
   }
   ```

---

## Common Scenarios

### Scenario 1: New MFE Needs API Access

**Steps:**

1. **Import core-services in your MFE:**
   ```bash
   npm install @org/core-services
   ```

2. **Configure HTTP client with interceptor:**
   ```typescript
   // In MFE's app.config.ts
   import { authInterceptor } from '@org/core-services';
   
   export const appConfig: ApplicationConfig = {
     providers: [
       provideHttpClient(withInterceptors([authInterceptor]))
     ]
   };
   ```

3. **Make API calls normally:**
   ```typescript
   // In your component
   constructor(private http: HttpClient) {}
   
   loadData() {
     // Token automatically added!
     this.http.get('https://api.example.com/data').subscribe(
       data => this.data = data
     );
   }
   ```

4. **Handle auth state:**
   ```typescript
   import { AuthService } from '@org/core-services';
   
   constructor(
     private http: HttpClient,
     private authService: AuthService
   ) {}
   
   ngOnInit() {
     if (!this.authService.isAuthenticated()) {
       console.log('Not authenticated');
       // Shell will handle login redirect
       return;
     }
     this.loadData();
   }
   ```

### Scenario 2: MFE Needs User Information

**Steps:**

1. **Subscribe to user changes:**
   ```typescript
   import { AuthService, UserInfo } from '@org/core-services';
   
   export class MfeComponent implements OnInit {
     user: UserInfo | null = null;
     
     constructor(private authService: AuthService) {}
     
     ngOnInit() {
       this.authService.user$.subscribe(user => {
         this.user = user;
         console.log('User email:', user?.email);
         console.log('User ID:', user?.sub);
         this.loadUserData(user?.sub);
       });
     }
     
     loadUserData(userId: string | undefined) {
       if (!userId) return;
       this.http.get(`/api/users/${userId}/data`).subscribe(
         data => console.log('User data:', data)
       );
     }
   }
   ```

2. **Get user role from RoleService:**
   ```typescript
   import { RoleService, User, UserRole } from '@org/core-services';
   
   export class MfeComponent implements OnInit {
     currentUser: User | null = null;
     isAdmin: boolean = false;
     
     constructor(private roleService: RoleService) {}
     
     ngOnInit() {
       this.roleService.currentUser$.subscribe(user => {
         this.currentUser = user;
         this.isAdmin = user?.role === UserRole.SUPER_ADMIN;
       });
     }
   }
   ```

### Scenario 3: MFE Needs to Refresh Data on Token Update

**Steps:**

1. **Listen to token update events:**
   ```typescript
   import { EventBusService } from '@org/core-services';
   
   export class MfeComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();
     
     constructor(private eventBus: EventBusService) {}
     
     ngOnInit() {
       this.eventBus.onePlusNEvents
         .pipe(takeUntil(this.destroy$))
         .subscribe(event => {
           try {
             const parsedEvent = JSON.parse(event as string);
             
             if (parsedEvent.type === 'auth:token_updated') {
               console.log('Token refreshed, reloading data');
               this.loadData();
             }
           } catch (e) {
             // Not a JSON event
           }
         });
     }
     
     ngOnDestroy() {
       this.destroy$.next();
       this.destroy$.complete();
     }
   }
   ```

### Scenario 4: MFE Needs Custom Headers

**Steps:**

1. **Add custom headers to specific requests:**
   ```typescript
   loadData() {
     const headers = {
       'X-Custom-Header': 'value',
       'X-Request-ID': this.generateRequestId()
     };
     
     // Token still added automatically by interceptor
     this.http.get('/api/data', { headers }).subscribe(
       data => this.data = data
     );
   }
   ```

2. **Add custom headers to all requests from MFE:**
   ```typescript
   // Create custom interceptor
   export const customHeaderInterceptor: HttpInterceptorFn = (req, next) => {
     const customReq = req.clone({
       setHeaders: {
         'X-MFE-Name': 'my-sales',
         'X-MFE-Version': '1.0.0'
       }
     });
     return next(customReq);
   };
   
   // Register both interceptors
   provideHttpClient(
     withInterceptors([
       authInterceptor,       // Adds token
       customHeaderInterceptor // Adds custom headers
     ])
   )
   ```

### Scenario 5: Development Without Backend

**Steps:**

1. **Use dev mimic user:**
   ```typescript
   import { RoleService, User, UserRole } from '@org/core-services';
   
   export class MfeComponent implements OnInit {
     constructor(private roleService: RoleService) {}
     
     ngOnInit() {
       // Check if in dev mode
       const isDev = !environment.production;
       
       if (isDev) {
         const devUser: User = {
           id: 'dev-123',
           name: 'Dev User',
           email: 'dev@example.com',
           role: UserRole.SUPER_ADMIN
         };
         this.roleService.setDevMimicUser(devUser);
       }
     }
   }
   ```

2. **Mock API responses:**
   ```typescript
   import { of } from 'rxjs';
   
   loadData() {
     const isDev = !environment.production;
     
     if (isDev) {
       // Use mock data
       const mockData = [
         { id: 1, name: 'Item 1' },
         { id: 2, name: 'Item 2' }
       ];
       this.data = mockData;
       return;
     }
     
     // Real API call (token added automatically)
     this.http.get('/api/data').subscribe(
       data => this.data = data
     );
   }
   ```

3. **Use HTTP interceptor to mock responses:**
   ```typescript
   export const mockInterceptor: HttpInterceptorFn = (req, next) => {
     const isDev = !environment.production;
     
     if (isDev && req.url.includes('/api/')) {
       // Return mock data
       const mockData = { success: true, data: [] };
       return of(new HttpResponse({ status: 200, body: mockData }));
     }
     
     return next(req);
   };
   ```

---

## Summary

### For Shell Developers:
1. ✅ Zitadel integration is already complete
2. ✅ Tokens stored in sessionStorage
3. ✅ authInterceptor automatically adds tokens to requests
4. ✅ EventBus emits authentication events
5. ⚠️ Consider implementing token refresh logic
6. ⚠️ Consider adding token expiration checking

### For MFE Developers:
1. ✅ Import `@org/core-services` library
2. ✅ Register `authInterceptor` in your app config
3. ✅ Make HTTP calls normally - tokens added automatically
4. ✅ Subscribe to `authService.user$` for user info
5. ✅ Listen to EventBus for auth state changes
6. ✅ Handle 401 errors gracefully

### For API Developers:
1. ✅ Validate Bearer tokens from Authorization header
2. ✅ Use Zitadel's JWKS endpoint for signature verification
3. ✅ Extract user identity from token's `sub` claim
4. ✅ Apply user permissions in database queries
5. ✅ Return 401 for invalid/expired tokens
6. ✅ Configure CORS to allow Shell origin

### Architecture Benefits:
- 🔒 **Secure**: Tokens in sessionStorage, CSRF protection
- 🔄 **Scalable**: Shared singleton services across MFEs
- 🚀 **Simple**: Automatic token injection, no manual handling
- 🎯 **Flexible**: Works for both standalone and federated MFEs
- 📡 **Reactive**: Event-driven communication via EventBus

---

## Next Steps & Recommendations

### Immediate Improvements:

1. **Token Expiration Handling:**
   - Add expiration checking in `getToken()`
   - Implement automatic token refresh
   - Add expiration warnings to user

2. **Error Handling:**
   - Create global error interceptor for 401/403
   - Auto-redirect to login on token expiration
   - Show user-friendly error messages

3. **Token Refresh:**
   - Implement silent refresh with iframe
   - Or request refresh_token from Zitadel
   - Auto-refresh 5 minutes before expiry

### Future Enhancements:

1. **Multi-Tab Support:**
   - Sync tokens across tabs using localStorage events
   - Handle logout in one tab affecting all tabs

2. **Role Management:**
   - Fetch roles from Zitadel user metadata
   - Use Zitadel organizations for multi-tenancy
   - Implement backend role mapping service

3. **Audit Logging:**
   - Log all authentication events
   - Track API calls with user context
   - Monitor token usage and refresh patterns

4. **Security Headers:**
   - Implement Content Security Policy (CSP)
   - Add HSTS headers
   - Enable XSS protection headers

---

**Questions or Issues?**

Check:
1. Browser DevTools → Application → Session Storage
2. Browser DevTools → Network → Request Headers
3. Browser Console for auth events
4. Zitadel admin panel for application configuration

**Still stuck?** Review the [Troubleshooting](#troubleshooting) section above.
