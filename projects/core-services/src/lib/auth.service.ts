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
 */
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
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
   * @param idToken - JWT ID token from OAuth2 provider
   * @returns UserInfo - Decoded user information
   */
  private decodeIdToken(idToken: string): UserInfo {
    try {
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return {
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
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
   * @param userInfo - User information to store
   */
  private setUserInfo(userInfo: UserInfo): void {
    sessionStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    this.userSubject.next(userInfo);
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
