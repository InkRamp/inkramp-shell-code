// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBusService } from './event-bus.service';

/**
 * Token response from OAuth2 provider
 */
interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * User information from ID token
 * Extended to include all possible Zitadel claims
 */
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  picture?: string;
  phone?: string;
  phone_verified?: boolean;
  updated_at?: number;
  // Zitadel-specific claims (URN format)
  'urn:zitadel:iam:org:project:roles'?: Record<string, any>;
  'urn:zitadel:iam:org:domain:primary'?: string;
  'urn:zitadel:iam:user:metadata'?: Record<string, any>;
  'urn:zitadel:iam:user:resourceowner:id'?: string;
  'urn:zitadel:iam:user:resourceowner:name'?: string;
  'urn:zitadel:iam:user:resourceowner:primary_domain'?: string;
  // Additional Zitadel claims that might be present
  [key: string]: any; // Allow for dynamic claims
}

/**
 * Authentication service for Zitadel OAuth2 integration
 * Handles login, logout, token management, and user session
 * Stores tokens in sessionStorage and emits authentication events for MicroApps
 * 
 * NOTE: All navigation logic using setTimeout is commented out as per requirements.
 * To enable navigation after auth operations, uncomment the marked sections in consuming components.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of pokemon';

  // Standard JWT claims that should be excluded from additional claims
  private readonly STANDARD_JWT_CLAIMS = [
    'sub', 'name', 'email', 'email_verified', 'preferred_username',
    'given_name', 'family_name', 'locale', 'picture', 'phone',
    'phone_verified', 'updated_at', 'iss', 'aud', 'exp', 'iat',
    'auth_time', 'nonce', 'acr', 'amr', 'azp'
  ];

  // Zitadel configuration
  private readonly ISSUER_BASE_URL = 'https://topfix-wrczmn.us1.zitadel.cloud';
  private readonly CLIENT_ID = '336777344075263315';
  private readonly REDIRECT_URI = 'https://opensourcekd.github.io/i17e/auth-callback';
  private readonly SCOPE = 'openid profile email';
  private readonly TOKEN_KEY = 'zitadel_token';
  private readonly USER_INFO_KEY = 'zitadel_user_info';

  private userSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfoFromStorage());
  public user$: Observable<UserInfo | null> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private eventBus: EventBusService
  ) {
    console.log("In constructor of auth service in i17e");
  }

  login(user?: string) {
    if (user) {
      console.log(`in i17e [AuthService] Logged in: ${user}`);
    }
    this.redirectToZitadelLogin();
  }

  /**
   * Redirect to Zitadel OAuth2 authorization endpoint
   * Stores state and code verifier for PKCE flow validation
   */
  private redirectToZitadelLogin(): void {
    const authUrl = new URL(`${this.ISSUER_BASE_URL}/oauth/v2/authorize`);
    const state = this.generateRandomState();
    const codeVerifier = this.generateCodeVerifier();
    
    // Store state and code verifier for validation
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('code_verifier', codeVerifier);

    authUrl.searchParams.append('client_id', this.CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', this.REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.SCOPE);
    authUrl.searchParams.append('state', state);

    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth2 callback after successful authorization
   * Validates state, exchanges code for tokens, and stores user info
   * 
   * NOTE: Navigation after successful/failed authentication should be handled in the calling component
   * using setTimeout. See commented examples in app.component.ts
   * 
   * @param code - Authorization code from OAuth2 provider
   * @param state - State parameter for CSRF protection
   * @returns Promise<boolean> - True if authentication successful, false otherwise
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (state !== storedState) {
      console.error('[AuthService] State mismatch - possible CSRF attack');
      return false;
    }

    try {
      const tokenResponse = await this.exchangeCodeForToken(code);
      this.setToken(tokenResponse.access_token);
      
      // Decode and store user info from ID token
      const userInfo = this.decodeIdToken(tokenResponse.id_token);
      this.setUserInfo(userInfo);
      
      // Clean up
      sessionStorage.removeItem('oauth_state');
      sessionStorage.removeItem('code_verifier');
      
      console.log('[AuthService] Authentication successful');
      return true;
    } catch (error) {
      console.error('[AuthService] Error exchanging code for token:', error);
      return false;
    }
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code
   * @returns Promise<TokenResponse> - Token response from OAuth2 provider
   */
  private async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const tokenUrl = `${this.ISSUER_BASE_URL}/oauth/v2/token`;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.REDIRECT_URI,
      client_id: this.CLIENT_ID,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Decode JWT ID token to extract user information
   * Extracts and logs ALL claims from Zitadel including custom URN claims
   * NOTE: Logging is verbose for development/debugging purposes
   * @param idToken - JWT ID token from OAuth2 provider
   * @returns UserInfo - Decoded user information with all available claims
   */
  private decodeIdToken(idToken: string): UserInfo {
    try {
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      // Log all claims for debugging and visibility
      // Note: In production, consider using a proper logging service with log levels
      console.log('='.repeat(80));
      console.log('[AuthService] 🔍 ZITADEL ID TOKEN - ALL CLAIMS:');
      console.log('='.repeat(80));
      
      // Standard OIDC claims
      console.log('\n📋 Standard OIDC Claims:');
      console.log('  • sub (Subject/User ID):', decoded.sub);
      console.log('  • name:', decoded.name);
      console.log('  • email:', decoded.email);
      console.log('  • email_verified:', decoded.email_verified);
      console.log('  • preferred_username:', decoded.preferred_username);
      console.log('  • given_name:', decoded.given_name);
      console.log('  • family_name:', decoded.family_name);
      console.log('  • locale:', decoded.locale);
      console.log('  • picture:', decoded.picture);
      console.log('  • phone:', decoded.phone);
      console.log('  • phone_verified:', decoded.phone_verified);
      console.log('  • updated_at:', decoded.updated_at);
      
      // Zitadel-specific URN claims
      console.log('\n🏢 Zitadel Organization Claims:');
      const orgClaims = Object.keys(decoded).filter(key => key.startsWith('urn:zitadel'));
      
      if (orgClaims.length > 0) {
        orgClaims.forEach(claim => {
          const value = decoded[claim];
          if (typeof value === 'object') {
            console.log(`  • ${claim}:`, JSON.stringify(value, null, 2));
          } else {
            console.log(`  • ${claim}:`, value);
          }
        });
      } else {
        console.log('  No Zitadel-specific claims found');
      }
      
      // Additional/custom claims
      console.log('\n🔧 Additional Claims:');
      const additionalClaims = Object.keys(decoded).filter(
        key => !this.STANDARD_JWT_CLAIMS.includes(key) && !key.startsWith('urn:zitadel')
      );
      
      if (additionalClaims.length > 0) {
        additionalClaims.forEach(claim => {
          const value = decoded[claim];
          if (typeof value === 'object') {
            console.log(`  • ${claim}:`, JSON.stringify(value, null, 2));
          } else {
            console.log(`  • ${claim}:`, value);
          }
        });
      } else {
        console.log('  No additional claims found');
      }
      
      // Token metadata
      console.log('\n🔐 Token Metadata:');
      console.log('  • iss (Issuer):', decoded.iss);
      console.log('  • aud (Audience):', decoded.aud);
      console.log('  • exp (Expiration):', decoded.exp, decoded.exp ? `(${new Date(decoded.exp * 1000).toISOString()})` : '');
      console.log('  • iat (Issued At):', decoded.iat, decoded.iat ? `(${new Date(decoded.iat * 1000).toISOString()})` : '');
      console.log('  • auth_time:', decoded.auth_time);
      console.log('  • nonce:', decoded.nonce);
      console.log('  • azp (Authorized Party):', decoded.azp);
      
      // Complete claim dump
      // WARNING: This logs the complete token which may contain sensitive data
      // In production, consider removing or sanitizing this log
      console.log('\n📦 Complete Token Payload (JSON):');
      console.log(JSON.stringify(decoded, null, 2));
      console.log('='.repeat(80));
      
      // Return the complete decoded object with all claims
      return {
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        email_verified: decoded.email_verified,
        preferred_username: decoded.preferred_username,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
        locale: decoded.locale,
        picture: decoded.picture,
        phone: decoded.phone,
        phone_verified: decoded.phone_verified,
        updated_at: decoded.updated_at,
        // Include all Zitadel-specific claims
        ...Object.keys(decoded)
          .filter(key => key.startsWith('urn:zitadel'))
          .reduce((acc, key) => ({ ...acc, [key]: decoded[key] }), {}),
        // Include any other claims (excluding standard JWT claims)
        ...Object.keys(decoded)
          .filter(key => !this.STANDARD_JWT_CLAIMS.includes(key) && !key.startsWith('urn:zitadel'))
          .reduce((acc, key) => ({ ...acc, [key]: decoded[key] }), {})
      };
    } catch (error) {
      console.error('[AuthService] Error decoding ID token:', error);
      return { sub: '' };
    }
  }

  /**
   * Logout user and clear authentication state
   * Removes tokens and user info from storage and emits logout event
   */
  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_INFO_KEY);
    this.userSubject.next(null);
    this.emitAuthEvent('logout', null);
    console.log('[AuthService] User logged out');
  }

  /**
   * Get current access token from sessionStorage
   * @returns string | null - Access token or null if not authenticated
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Set access token in storage and emit event for MicroApps
   * @param token - Access token to store
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    this.emitAuthEvent('token_updated', { token });
  }

  /**
   * Check if user is authenticated
   * @returns boolean - True if user has valid token
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get current user information
   * @returns UserInfo | null - Current user or null if not authenticated
   */
  getUser(): UserInfo | null {
    return this.userSubject.value;
  }

  /**
   * Get user information from sessionStorage
   * @returns UserInfo | null - Stored user info or null
   */
  private getUserInfoFromStorage(): UserInfo | null {
    const userJson = sessionStorage.getItem(this.USER_INFO_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Set user information in storage, update observable and emit event for MicroApps
   * Logs all Zitadel claims for debugging
   * @param userInfo - User information to store
   */
  private setUserInfo(userInfo: UserInfo): void {
    sessionStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    this.userSubject.next(userInfo);
    
    // Log stored user info with all claims
    console.log('[AuthService] 💾 User info stored in sessionStorage:');
    console.log('  Standard claims:', {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      email_verified: userInfo.email_verified
    });
    
    // Log Zitadel-specific claims if present
    const zitadelClaims = Object.keys(userInfo).filter(key => key.startsWith('urn:zitadel'));
    if (zitadelClaims.length > 0) {
      console.log('  Zitadel claims stored:');
      zitadelClaims.forEach(claim => {
        console.log(`    • ${claim}:`, userInfo[claim]);
      });
    }
    
    this.emitAuthEvent('user_info_updated', userInfo);
  }

  /**
   * Emit authentication event for MicroApps to consume
   * Events are emitted via EventBus for cross-MFE communication
   * @param eventType - Type of authentication event
   * @param payload - Event payload
   */
  private emitAuthEvent(eventType: string, payload: any): void {
    const event = {
      type: `auth:${eventType}`,
      payload,
      timestamp: new Date().toISOString()
    };
    this.eventBus.sendEvent(JSON.stringify(event));
    console.log('[AuthService] Auth event emitted:', event.type);
  }

  /**
   * Generate random state for CSRF protection
   * @returns string - Random state string
   */
  private generateRandomState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate code verifier for PKCE flow
   * @returns string - Random code verifier string
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
