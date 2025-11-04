# Proposed Solutions for Token Management Enhancement

## Problem Statement

> "Zitadel login is now working fine. But How do I use this zitadel token? How do MFE's use it? You know the architecture now. My DB, Zitadel, API and UI all are different systems."

## Current State Analysis

### ✅ What's Already Working

1. **Zitadel OAuth2 Integration**
   - Login redirect to Zitadel
   - Authorization code exchange for tokens
   - User info extraction from ID token
   - Token storage in sessionStorage

2. **Automatic Token Injection**
   - `authInterceptor` adds tokens to HTTP requests
   - Works across all MFEs via shared singleton
   - No manual token handling needed in most cases

3. **Cross-MFE Communication**
   - EventBus for auth event broadcasting
   - Shared AuthService instance across MFEs
   - User info synchronized via RoleService

4. **API Integration**
   - Centralized API services
   - Brand context support
   - Error handling with safe defaults

### ⚠️ Gaps & Improvement Opportunities

1. **Token Expiration Management**
   - No automatic token refresh
   - No expiration checking before API calls
   - No warning before token expires

2. **Multi-Tab/Window Support**
   - sessionStorage doesn't sync across tabs
   - User must login separately in each tab
   - No cross-tab logout synchronization

3. **Error Recovery**
   - No automatic retry on 401 errors
   - No graceful degradation for expired tokens
   - Limited error messaging to users

4. **Security Enhancements**
   - No token encryption in storage
   - No Content Security Policy headers
   - No audit logging for auth events

---

## Proposed Solutions

### Solution 1: Token Expiration & Auto-Refresh

#### Current Implementation
```typescript
// In AuthService
setToken(token: string): void {
  sessionStorage.setItem(this.TOKEN_KEY, token);
  this.emitAuthEvent('token_updated', { token });
}

getToken(): string | null {
  return sessionStorage.getItem(this.TOKEN_KEY);
}
```

#### Proposed Enhancement A: Add Expiration Checking

```typescript
// Enhanced token storage structure
interface TokenData {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: number;  // Unix timestamp
  issuedAt: number;   // Unix timestamp
}

class EnhancedAuthService {
  private tokenRefreshTimer?: number;

  /**
   * Store tokens with expiration metadata
   */
  setTokens(tokenResponse: TokenResponse): void {
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000);
    const tokenData: TokenData = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      idToken: tokenResponse.id_token,
      expiresAt,
      issuedAt: Date.now()
    };
    
    sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    this.emitAuthEvent('token_updated', { token: tokenResponse.access_token });
    
    // Schedule automatic refresh
    this.scheduleTokenRefresh(tokenData);
  }

  /**
   * Get token with expiration checking
   */
  getToken(): string | null {
    const data = this.getTokenData();
    if (!data) return null;
    
    // Check if expired
    if (this.isTokenExpired(data)) {
      console.warn('[AuthService] Token expired');
      this.handleExpiredToken();
      return null;
    }
    
    // Warn if expiring soon (5 minutes)
    if (this.isTokenExpiringSoon(data, 5 * 60 * 1000)) {
      console.warn('[AuthService] Token expiring soon, refreshing...');
      this.refreshToken();
    }
    
    return data.accessToken;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(tokenData: TokenData): boolean {
    return Date.now() >= tokenData.expiresAt;
  }

  /**
   * Check if token is expiring within threshold
   */
  private isTokenExpiringSoon(tokenData: TokenData, thresholdMs: number): boolean {
    return (tokenData.expiresAt - Date.now()) <= thresholdMs;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(tokenData: TokenData): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    // Refresh 5 minutes before expiry
    const refreshIn = tokenData.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (refreshIn > 0) {
      this.tokenRefreshTimer = window.setTimeout(() => {
        this.refreshToken();
      }, refreshIn);
    }
  }

  /**
   * Handle expired token
   */
  private handleExpiredToken(): void {
    this.emitAuthEvent('token_expired', {
      message: 'Your session has expired. Please login again.'
    });
    this.logout();
  }

  private getTokenData(): TokenData | null {
    const data = sessionStorage.getItem(this.TOKEN_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('[AuthService] Invalid token data');
      return null;
    }
  }
}
```

#### Proposed Enhancement B: Silent Token Refresh

```typescript
/**
 * Refresh token using iframe (silent authentication)
 */
async refreshToken(): Promise<boolean> {
  console.log('[AuthService] Refreshing token silently...');
  
  try {
    // Create hidden iframe for silent auth
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.id = 'zitadel-silent-refresh';
    
    // Build silent auth URL
    const authUrl = new URL(`${this.ISSUER_BASE_URL}/oauth/v2/authorize`);
    authUrl.searchParams.append('client_id', this.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.SCOPE);
    authUrl.searchParams.append('prompt', 'none'); // Silent auth
    
    document.body.appendChild(iframe);
    
    // Wait for callback via postMessage
    const result = await this.waitForSilentCallback();
    
    // Clean up iframe
    document.body.removeChild(iframe);
    
    if (result.success) {
      console.log('[AuthService] Token refreshed successfully');
      return true;
    } else {
      console.error('[AuthService] Silent refresh failed:', result.error);
      this.handleExpiredToken();
      return false;
    }
  } catch (error) {
    console.error('[AuthService] Error during silent refresh:', error);
    this.handleExpiredToken();
    return false;
  }
}

/**
 * Wait for silent authentication callback
 */
private waitForSilentCallback(): Promise<{success: boolean; error?: string}> {
  return new Promise((resolve) => {
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      
      if (event.data.type === 'silent-auth-success') {
        window.removeEventListener('message', messageHandler);
        resolve({ success: true });
      } else if (event.data.type === 'silent-auth-error') {
        window.removeEventListener('message', messageHandler);
        resolve({ success: false, error: event.data.error });
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      resolve({ success: false, error: 'Timeout' });
    }, 10000);
  });
}
```

#### Proposed Enhancement C: Refresh Token Grant

```typescript
/**
 * Refresh access token using refresh token grant
 */
async refreshTokenWithGrant(): Promise<boolean> {
  const tokenData = this.getTokenData();
  if (!tokenData?.refreshToken) {
    console.error('[AuthService] No refresh token available');
    return false;
  }
  
  try {
    const response = await fetch(`${this.ISSUER_BASE_URL}/oauth/v2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokenData.refreshToken,
        client_id: this.CLIENT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens: TokenResponse = await response.json();
    this.setTokens(tokens);
    
    console.log('[AuthService] Token refreshed using refresh token');
    return true;
  } catch (error) {
    console.error('[AuthService] Token refresh failed:', error);
    this.handleExpiredToken();
    return false;
  }
}
```

---

### Solution 2: Multi-Tab Synchronization

#### Current Issue
- sessionStorage is isolated per tab
- User must login separately in each tab
- Logout in one tab doesn't affect others

#### Proposed Solution: Cross-Tab Communication

```typescript
/**
 * Sync authentication state across browser tabs
 */
class CrossTabAuthSync {
  private readonly BROADCAST_CHANNEL = 'auth-sync-channel';
  private channel?: BroadcastChannel;

  constructor(private authService: AuthService) {
    this.initializeBroadcastChannel();
    this.setupStorageListener();
  }

  /**
   * Use BroadcastChannel API for modern browsers
   */
  private initializeBroadcastChannel(): void {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(this.BROADCAST_CHANNEL);
      
      this.channel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    }
  }

  /**
   * Fallback to localStorage events for older browsers
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_sync_event') {
        const message = JSON.parse(event.newValue || '{}');
        this.handleSyncMessage(message);
      }
    });
  }

  /**
   * Broadcast auth event to other tabs
   */
  broadcastAuthEvent(type: string, payload: any): void {
    const message = { type, payload, timestamp: Date.now() };
    
    // Use BroadcastChannel if available
    if (this.channel) {
      this.channel.postMessage(message);
    } else {
      // Fallback to localStorage
      localStorage.setItem('auth_sync_event', JSON.stringify(message));
      localStorage.removeItem('auth_sync_event'); // Trigger storage event
    }
  }

  /**
   * Handle messages from other tabs
   */
  private handleSyncMessage(message: any): void {
    switch (message.type) {
      case 'login':
        this.syncLoginFromOtherTab(message.payload);
        break;
      case 'logout':
        this.syncLogoutFromOtherTab();
        break;
      case 'token_refresh':
        this.syncTokenFromOtherTab(message.payload);
        break;
    }
  }

  private syncLoginFromOtherTab(tokenData: TokenData): void {
    console.log('[CrossTabSync] Syncing login from another tab');
    sessionStorage.setItem('zitadel_token', JSON.stringify(tokenData));
    this.authService.notifyTokenUpdate();
  }

  private syncLogoutFromOtherTab(): void {
    console.log('[CrossTabSync] Syncing logout from another tab');
    this.authService.logout();
    window.location.reload(); // Refresh to clear state
  }

  private syncTokenFromOtherTab(tokenData: TokenData): void {
    console.log('[CrossTabSync] Syncing token refresh from another tab');
    sessionStorage.setItem('zitadel_token', JSON.stringify(tokenData));
  }
}

// Usage in AuthService
export class AuthService {
  private crossTabSync: CrossTabAuthSync;

  constructor(/* ... */) {
    this.crossTabSync = new CrossTabAuthSync(this);
  }

  login(): void {
    // ... existing login logic
  }

  logout(): void {
    // ... existing logout logic
    this.crossTabSync.broadcastAuthEvent('logout', null);
  }

  setTokens(tokenResponse: TokenResponse): void {
    // ... existing token storage
    this.crossTabSync.broadcastAuthEvent('login', tokenData);
  }

  refreshToken(): void {
    // ... existing refresh logic
    this.crossTabSync.broadcastAuthEvent('token_refresh', tokenData);
  }
}
```

---

### Solution 3: Enhanced Error Handling

#### Current Issue
- 401 errors not handled gracefully
- No automatic retry logic
- Limited user feedback

#### Proposed Solution: Error Recovery Interceptor

```typescript
/**
 * Enhanced error handling interceptor
 */
export const errorRecoveryInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) => {
        // Only retry on specific errors
        if (error.status === 401 && retryCount === 1) {
          console.log('[ErrorRecovery] 401 error, attempting token refresh...');
          
          // Try to refresh token before retry
          return from(authService.refreshToken()).pipe(
            switchMap(success => {
              if (success) {
                console.log('[ErrorRecovery] Token refreshed, retrying request');
                return of(null);
              } else {
                throw error;
              }
            })
          );
        }
        
        // Don't retry other errors
        throw error;
      }
    }),
    catchError((error: HttpErrorResponse) => {
      return this.handleHttpError(error, authService, router);
    })
  );
};

function handleHttpError(
  error: HttpErrorResponse, 
  authService: AuthService,
  router: Router
): Observable<never> {
  let errorMessage = 'An error occurred';
  
  switch (error.status) {
    case 401:
      errorMessage = 'Your session has expired. Please login again.';
      console.error('[ErrorRecovery] Unauthorized, redirecting to login');
      authService.logout();
      // Could redirect to login page or show modal
      break;
      
    case 403:
      errorMessage = 'You do not have permission to access this resource.';
      console.error('[ErrorRecovery] Forbidden');
      break;
      
    case 404:
      errorMessage = 'The requested resource was not found.';
      console.error('[ErrorRecovery] Not found');
      break;
      
    case 500:
      errorMessage = 'Server error. Please try again later.';
      console.error('[ErrorRecovery] Server error');
      break;
      
    case 0:
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
      console.error('[ErrorRecovery] Network error or CORS issue');
      break;
      
    default:
      errorMessage = `Error: ${error.message}`;
      console.error('[ErrorRecovery] Unexpected error:', error);
  }
  
  // Emit error event for UI components to display
  window.dispatchEvent(new CustomEvent('api-error', {
    detail: { message: errorMessage, error }
  }));
  
  return throwError(() => new Error(errorMessage));
}
```

---

### Solution 4: Security Enhancements

#### Proposed Enhancement A: Token Encryption

```typescript
/**
 * Encrypt/decrypt tokens in storage using Web Crypto API
 */
class SecureTokenStorage {
  private encryptionKey: CryptoKey | null = null;

  async initialize(): Promise<void> {
    // Generate encryption key (stored in memory only)
    this.encryptionKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // not extractable - can't be exported
      ['encrypt', 'decrypt']
    );
  }

  async setSecureItem(key: string, value: string): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const encrypted = await this.encrypt(value);
    sessionStorage.setItem(key, encrypted);
  }

  async getSecureItem(key: string): Promise<string | null> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;

    return this.decrypt(encrypted);
  }

  private async encrypt(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  private async decrypt(ciphertext: string): Promise<string> {
    // Convert from base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
```

#### Proposed Enhancement B: Content Security Policy

```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https:;
        font-src 'self' data:;
        connect-src 'self' 
          https://topfix-wrczmn.us1.zitadel.cloud 
          https://7f1m8qlvpd.execute-api.us-east-1.amazonaws.com;
        frame-src 'self' https://topfix-wrczmn.us1.zitadel.cloud;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      ">
```

#### Proposed Enhancement C: Audit Logging

```typescript
/**
 * Audit logging for authentication events
 */
class AuthAuditLogger {
  private readonly AUDIT_ENDPOINT = '/api/audit/auth-events';

  logEvent(event: AuditEvent): void {
    const auditLog = {
      eventType: event.type,
      userId: event.userId,
      timestamp: new Date().toISOString(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      details: event.details
    };

    // Send to audit API (non-blocking)
    this.sendAuditLog(auditLog).catch(error => {
      console.error('[AuditLogger] Failed to send audit log:', error);
    });

    // Also log locally for debugging
    console.log('[Audit]', auditLog);
  }

  private async sendAuditLog(log: any): Promise<void> {
    try {
      await fetch(this.AUDIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
        // Use sendBeacon for reliability on page unload
        keepalive: true
      });
    } catch (error) {
      // Fallback to navigator.sendBeacon
      if ('sendBeacon' in navigator) {
        navigator.sendBeacon(
          this.AUDIT_ENDPOINT,
          JSON.stringify(log)
        );
      }
    }
  }

  private getClientIP(): string {
    // IP should be determined server-side for accuracy
    return 'determined-by-server';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }
}

// Usage in AuthService
export class AuthService {
  private auditLogger = new AuthAuditLogger();

  login(): void {
    this.auditLogger.logEvent({
      type: 'login_initiated',
      userId: null,
      details: { method: 'zitadel_oauth2' }
    });
    // ... rest of login logic
  }

  handleCallback(code: string, state: string): Promise<boolean> {
    // ... existing logic
    
    if (success) {
      this.auditLogger.logEvent({
        type: 'login_success',
        userId: userInfo.sub,
        details: { email: userInfo.email }
      });
    } else {
      this.auditLogger.logEvent({
        type: 'login_failed',
        userId: null,
        details: { reason: 'callback_validation_failed' }
      });
    }
  }

  logout(): void {
    const user = this.getUser();
    this.auditLogger.logEvent({
      type: 'logout',
      userId: user?.sub,
      details: { email: user?.email }
    });
    // ... rest of logout logic
  }
}
```

---

## Implementation Roadmap

### Phase 1: Critical Improvements (High Priority)

1. **Token Expiration Management** (1-2 days)
   - Add expiration checking to `getToken()`
   - Implement automatic token refresh
   - Add expiration warnings
   - **Impact:** Prevents unexpected logout, improves UX

2. **Enhanced Error Handling** (1 day)
   - Add error recovery interceptor
   - Implement automatic retry logic
   - Add user-friendly error messages
   - **Impact:** Better reliability, improved user experience

### Phase 2: User Experience (Medium Priority)

3. **Multi-Tab Synchronization** (2-3 days)
   - Implement BroadcastChannel communication
   - Add localStorage fallback
   - Sync login/logout across tabs
   - **Impact:** Consistent auth state across tabs

4. **User Feedback & Notifications** (1-2 days)
   - Add toast notifications for auth events
   - Show countdown before token expiration
   - Display clear error messages
   - **Impact:** Users know what's happening

### Phase 3: Security & Compliance (Medium Priority)

5. **Audit Logging** (2-3 days)
   - Log all authentication events
   - Send logs to audit API
   - Implement log retention policy
   - **Impact:** Compliance, debugging, security monitoring

6. **Content Security Policy** (1 day)
   - Add CSP headers
   - Configure allowed sources
   - Test with all MFEs
   - **Impact:** XSS protection

### Phase 4: Advanced Features (Low Priority)

7. **Token Encryption** (2-3 days)
   - Implement SecureTokenStorage
   - Migrate from plain sessionStorage
   - Add encryption key rotation
   - **Impact:** Enhanced security for sensitive deployments

8. **Remember Me Functionality** (1-2 days)
   - Add checkbox to login
   - Use localStorage for persistence
   - Implement secure cookie alternative
   - **Impact:** Convenience for users

---

## Decision Matrix

| Solution | Priority | Effort | Impact | Dependencies |
|----------|----------|--------|--------|--------------|
| Token Expiration | **High** | Medium | **High** | None |
| Error Recovery | **High** | Low | High | None |
| Multi-Tab Sync | Medium | Medium | Medium | None |
| Audit Logging | Medium | Medium | Medium | API support |
| CSP Headers | Medium | Low | Medium | None |
| Token Encryption | Low | Medium | Low | None |
| Remember Me | Low | Low | Low | Token expiration |

---

## API Requirements

For these solutions to work optimally, the API should:

1. **Token Validation:**
   ```
   - Validate JWT signature using Zitadel JWKS
   - Check expiration (exp claim)
   - Verify issuer (iss claim)
   - Extract user ID from sub claim
   ```

2. **CORS Configuration:**
   ```
   Access-Control-Allow-Origin: https://opensourcekd.github.io
   Access-Control-Allow-Headers: Authorization, Content-Type, X-Request-ID
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Credentials: true
   ```

3. **Error Responses:**
   ```json
   {
     "error": "unauthorized",
     "message": "Token expired or invalid",
     "code": "TOKEN_EXPIRED",
     "timestamp": "2024-01-01T00:00:00Z"
   }
   ```

4. **Audit Endpoint:**
   ```
   POST /api/audit/auth-events
   Body: {
     eventType: string,
     userId: string,
     timestamp: string,
     details: object
   }
   ```

---

## Conclusion

The current implementation provides a **solid foundation** for token-based authentication across the distributed architecture. The proposed solutions address the remaining gaps and enhance:

- **Reliability:** Automatic token refresh, error recovery
- **Security:** Encryption, CSP, audit logging
- **User Experience:** Multi-tab sync, better error messages
- **Compliance:** Comprehensive audit trail

### Recommended Next Steps:

1. ✅ **Review** this document with the team
2. ✅ **Prioritize** solutions based on business needs
3. ✅ **Implement** Phase 1 (critical improvements) first
4. ✅ **Test** thoroughly in all MFEs
5. ✅ **Monitor** auth events in production
6. ✅ **Iterate** based on user feedback

### Quick Wins (Can implement today):

- Add expiration checking to `getToken()`
- Implement basic error recovery interceptor
- Add CSP headers to index.html
- Log auth events to console for debugging

---

**Questions or Feedback?**

These are **proposed solutions** - not implemented code changes. Review, discuss, and modify based on your specific requirements.

For implementation assistance, refer to the code examples in this document and the complete guide in `ZITADEL_TOKEN_USAGE_IN_MFES.md`.
