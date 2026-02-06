// src/angular/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EventBusService } from './event-bus.service';
import { Auth0Client as Auth0ClientType, createAuth0Client } from '@auth0/auth0-spa-js';
import { jwtDecode } from 'jwt-decode';
import { 
  AUTH0_CONFIG, 
  STORAGE_CONFIG, 
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  removeStorageItem 
} from './config/auth.config';

/**
 * User information from ID token
 * Standard OIDC claims compatible with Auth0
 */
export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  locale?: string;
  picture?: string;
  phone?: string;
  phone_verified?: boolean;
  updated_at?: string;
  // Application-specific claims
  role?: string;
  org?: string;
  organization?: string;
  // Auth0 custom claims (namespace format)
  // Example: 'https://your-domain.com/roles'?: string[];
  [key: string]: any; // Allow for dynamic claims
}

/**
 * Simplified user data extracted from token
 */
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
}

/**
 * Authentication service for Auth0 integration
 * Handles login, logout, token management, and user session
 * Uses sessionStorage for sensitive data and emits authentication events for MicroApps
 * 
 * Configuration is centralized in config/auth.config.ts for easy management
 * 
 * NOTE: All navigation logic using setTimeout is commented out as per requirements.
 * To enable navigation after auth operations, uncomment the marked sections in consuming components.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Standard JWT claims that should be excluded from additional claims
  private readonly STANDARD_JWT_CLAIMS = [
    'sub', 'name', 'email', 'email_verified', 'preferred_username',
    'given_name', 'family_name', 'nickname', 'locale', 'picture', 'phone',
    'phone_verified', 'updated_at', 'iss', 'aud', 'exp', 'iat',
    'auth_time', 'nonce', 'acr', 'amr', 'azp', 'at_hash', 'c_hash'
  ];

  private auth0Client: Auth0ClientType | null = null;
  private initializationPromise: Promise<void>;
  private userSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfoFromStorage());
  public user$: Observable<UserInfo | null> = this.userSubject.asObservable();

  constructor(
    private eventBus: EventBusService
  ) {
    console.log("[AuthService] Initializing Auth0 authentication service");
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: Constructor called, starting initialization');
    this.initializationPromise = this.initializeAuth0();
  }

  /**
   * Initialize Auth0 client
   */
  private async initializeAuth0(): Promise<void> {
    try {
      console.log("[AuthService] Starting Auth0 client initialization...");
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: initializeAuth0 called');
      
      // Defensive check for AUTH0_CONFIG
      if (!AUTH0_CONFIG || typeof AUTH0_CONFIG !== 'object') {
        // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
        console.error('[AuthService] 🔍 DEBUG: AUTH0_CONFIG validation failed - invalid or undefined');
        throw new Error('[AuthService] AUTH0_CONFIG is not defined or invalid');
      }
      
      if (!AUTH0_CONFIG.domain || !AUTH0_CONFIG.clientId) {
        // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
        console.error('[AuthService] 🔍 DEBUG: AUTH0_CONFIG validation failed - missing domain or clientId', {
          domain: AUTH0_CONFIG.domain,
          clientId: AUTH0_CONFIG.clientId ? '[REDACTED]' : undefined
        });
        throw new Error('[AuthService] AUTH0_CONFIG is missing required fields (domain, clientId)');
      }
      
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Creating Auth0 client with config:', {
        domain: AUTH0_CONFIG.domain,
        clientId: AUTH0_CONFIG.clientId ? '[REDACTED]' : undefined,
        redirectUri: AUTH0_CONFIG.redirectUri,
        scope: AUTH0_CONFIG.scope,
        audience: AUTH0_CONFIG.audience || 'not set'
      });
      
      this.auth0Client = await createAuth0Client({
        domain: AUTH0_CONFIG.domain,
        clientId: AUTH0_CONFIG.clientId,
        authorizationParams: {
          redirect_uri: AUTH0_CONFIG.redirectUri,
          scope: AUTH0_CONFIG.scope,
          ...(AUTH0_CONFIG.audience && { audience: AUTH0_CONFIG.audience }),
        },
        cacheLocation: 'memory', // Use memory cache instead of localStorage
        useRefreshTokens: true, // Enable refresh tokens for better security
      });
      console.log("[AuthService] Auth0 client initialized successfully");
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Auth0 client created successfully');
    } catch (error) {
      console.error("[AuthService] Failed to initialize Auth0 client:", error);
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: initializeAuth0 failed with error:', error);
      throw error;
    }
  }

  /**
   * Ensure Auth0 client is initialized before use
   */
  private async ensureInitialized(): Promise<void> {
    await this.initializationPromise;
    if (!this.auth0Client) {
      throw new Error('[AuthService] Auth0 client failed to initialize');
    }
  }

  /**
   * Login with Auth0
   * Redirects to Auth0 Universal Login
   * Preserves current URL parameters (like invitation tokens) through the auth flow
   * 
   * @param user - Optional user identifier for logging
   * @param options - Optional login options including invitation and organization parameters
   */
  async login(user?: string, options?: { invitation?: string; organization?: string }): Promise<void> {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: login() called', { user, options });
    
    if (user) {
      console.log(`[AuthService] Logging in: ${user}`);
    }
    
    try {
      // Ensure Auth0 client is initialized
      await this.ensureInitialized();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Auth0 client ensured initialized for login');
      
      // Capture current URL search parameters to preserve through auth flow
      let appState: any = undefined;
      
      if (window.location.search) {
        const currentSearchParams = window.location.search;
        appState = { returnTo: currentSearchParams };
        console.log('[AuthService] Preserving URL parameters through auth flow:', currentSearchParams);
        // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
        console.log('[AuthService] 🔍 DEBUG: Captured URL search params for preservation:', currentSearchParams);
      }

      // Build authorization parameters
      const authorizationParams: any = {
        redirect_uri: AUTH0_CONFIG.redirectUri,
        scope: AUTH0_CONFIG.scope,
        ...(AUTH0_CONFIG.audience && { audience: AUTH0_CONFIG.audience }),
        ...(AUTH0_CONFIG.connection && { connection: AUTH0_CONFIG.connection }),
      };

      // Add organization invitation parameters if provided
      if (options?.invitation) {
        authorizationParams.invitation = options.invitation;
        console.log('[AuthService] Including invitation parameter:', options.invitation);
      }

      if (options?.organization) {
        authorizationParams.organization = options.organization;
        console.log('[AuthService] Including organization parameter:', options.organization);
      }

      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Authorization params prepared:', {
        redirect_uri: authorizationParams.redirect_uri,
        scope: authorizationParams.scope,
        audience: authorizationParams.audience || 'not set',
        connection: authorizationParams.connection || 'not set',
        invitation: authorizationParams.invitation || 'not set',
        organization: authorizationParams.organization || 'not set',
        hasAppState: !!appState
      });

      console.log('[AuthService] Starting Auth0 login redirect...');
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: About to call loginWithRedirect');
      await this.auth0Client!.loginWithRedirect({
        authorizationParams,
        ...(appState && { appState })
      });
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: loginWithRedirect completed (this may not be visible due to redirect)');
    } catch (error) {
      console.error("[AuthService] Login failed:", error);
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: login() failed with error:', error);
      // Emit login failure event
      this.emitAuthEvent('login_failure', { error: error instanceof Error ? error.message : String(error) });
      throw error; // Re-throw to allow caller to handle
    }
  }

  /**
   * Handle OAuth2 callback after successful authorization
   * Processes the callback and retrieves user info
   * 
   * NOTE: Navigation after successful/failed authentication should be handled in the calling component
   * using setTimeout. See commented examples in app.component.ts
   * 
   * @returns Promise<{ success: boolean, appState?: any }> - Success status and preserved appState
   */
  async handleCallback(): Promise<{ success: boolean, appState?: any }> {
    try {
      console.log("[AuthService] Processing Auth0 callback...");
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: handleCallback() called');
      console.log('[AuthService] 🔍 DEBUG: Current URL:', window.location.href);
      console.log('[AuthService] 🔍 DEBUG: URL params:', window.location.search);
      
      // Ensure Auth0 client is initialized
      await this.ensureInitialized();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Auth0 client ensured initialized for callback');
      
      // Process the callback
      const result = await this.auth0Client!.handleRedirectCallback();
      console.log("[AuthService] Callback processed successfully");
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: handleRedirectCallback result:', result);
      
      // Log preserved appState if present
      if (result.appState) {
        console.log('[AuthService] Restored appState from auth flow:', JSON.stringify(result.appState));
      } else {
        console.log('[AuthService] No appState restored (user may not have started from invitation link)');
      }

      // Get user info
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Fetching user info from Auth0');
      const user = await this.auth0Client!.getUser();
      if (user) {
        // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
        console.log('[AuthService] 🔍 DEBUG: User info retrieved successfully');
        this.logUserClaims(user);
        this.setUserInfo(user as UserInfo);
      } else {
        console.warn('[AuthService] No user info returned from Auth0');
        // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
        console.warn('[AuthService] 🔍 DEBUG: getUser() returned null or undefined');
        // Emit login failure event
        this.emitAuthEvent('login_failure', { error: 'No user info returned from Auth0' });
        return { success: false };
      }

      // Get and store access token
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Fetching access token');
      const token = await this.auth0Client!.getTokenSilently();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Access token retrieved, length:', token?.length || 0);
      this.setToken(token);
      
      // Decode and print the token to console
      this.decodeAndLogToken(token);

      console.log("[AuthService] Authentication successful");
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: handleCallback() completed successfully');
      // Emit login success event
      this.emitAuthEvent('login_success', { user, appState: result.appState });
      return { success: true, appState: result.appState };
    } catch (error) {
      console.error("[AuthService] Error processing callback:", error);
      console.error("[AuthService] Error details:", JSON.stringify(error, null, 2));
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: handleCallback() failed with error:', error);
      console.error('[AuthService] 🔍 DEBUG: Error type:', typeof error);
      console.error('[AuthService] 🔍 DEBUG: Error stack:', (error as any)?.stack);
      // Emit login failure event
      this.emitAuthEvent('login_failure', { error: error instanceof Error ? error.message : String(error) });
      return { success: false };
    }
  }

  /**
   * Decode and log the access token to console
   * NOTE: This logs sensitive token information to console for debugging purposes.
   * In production environments, consider disabling this or filtering console logs.
   * @param token - The JWT access token
   */
  private decodeAndLogToken(token: string): void {
    try {
      console.log('='.repeat(80));
      console.log('[AuthService] 🔓 DECODED ACCESS TOKEN:');
      console.log('='.repeat(80));
      
      const decoded = jwtDecode(token);
      console.log(JSON.stringify(decoded, null, 2));
      
      console.log('='.repeat(80));
    } catch (error) {
      console.error('[AuthService] Failed to decode token:', error);
    }
  }

  /**
   * Log all user claims for debugging
   * @param user - User info from Auth0
   */
  private logUserClaims(user: any): void {
    console.log('='.repeat(80));
    console.log('[AuthService] 🔍 AUTH0 ID TOKEN - ALL CLAIMS:');
    console.log('='.repeat(80));
    
    // Standard OIDC claims
    this.logStandardClaims(user);
    
    // Auth0 custom claims (namespaced)
    const customClaims = this.getCustomClaims(user);
    this.logClaims('\n🔑 Custom Claims (Auth0):', customClaims, user);
    
    // Additional claims
    const additionalClaims = this.getAdditionalClaims(user);
    this.logClaims('\n🔧 Additional Claims:', additionalClaims, user);
    
    // Complete claim dump
    console.log('\n📦 Complete User Object (JSON):');
    console.log(JSON.stringify(user, null, 2));
    console.log('='.repeat(80));
  }

  /**
   * Log standard OIDC claims
   * @param user - User info from Auth0
   */
  private logStandardClaims(user: any): void {
    console.log('\n📋 Standard OIDC Claims:');
    const standardClaimKeys = ['sub', 'name', 'email', 'email_verified', 'preferred_username', 
                                'given_name', 'family_name', 'nickname', 'locale', 'picture', 
                                'phone', 'phone_verified', 'updated_at'];
    
    standardClaimKeys.forEach(key => {
      const displayKey = key === 'sub' ? `${key} (Subject/User ID)` : key;
      console.log(`  • ${displayKey}:`, user[key]);
    });
  }

  /**
   * Log claims with consistent formatting
   * @param header - Section header to display
   * @param claims - Array of claim keys to log
   * @param user - User info object
   */
  private logClaims(header: string, claims: string[], user: any): void {
    console.log(header);
    
    if (claims.length === 0) {
      console.log('  No custom claims found');
      return;
    }
    
    claims.forEach(claim => {
      const value = user[claim];
      const formattedValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
      console.log(`  • ${claim}:`, formattedValue);
    });
  }

  /**
   * Get custom namespaced claims from user info
   * @param user - User info object
   * @returns Array of custom claim keys
   */
  private getCustomClaims(user: any): string[] {
    return Object.keys(user).filter(
      key => !this.STANDARD_JWT_CLAIMS.includes(key) && this.isNamespacedClaim(key)
    );
  }

  /**
   * Get additional non-namespaced claims from user info
   * @param user - User info object
   * @returns Array of additional claim keys
   */
  private getAdditionalClaims(user: any): string[] {
    return Object.keys(user).filter(
      key => !this.STANDARD_JWT_CLAIMS.includes(key) && !this.isNamespacedClaim(key)
    );
  }

  /**
   * Check if a claim key is namespaced
   * @param key - Claim key to check
   * @returns True if the key starts with http:// or https://
   */
  private isNamespacedClaim(key: string): boolean {
    return key.startsWith('http://') || key.startsWith('https://');
  }

  /**
   * Logout user and clear authentication state
   * Redirects to Auth0 logout endpoint and clears local state
   */
  async logout(): Promise<void> {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: logout() called');
    
    // Clear local storage
    removeStorageItem(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_CONFIG.TOKEN_STORAGE);
    removeStorageItem(STORAGE_KEYS.USER_INFO, STORAGE_CONFIG.USER_INFO_STORAGE);
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: Storage cleared (token and user info removed)');
    
    this.userSubject.next(null);
    this.emitAuthEvent('logout', null);
    
    console.log('[AuthService] User logged out, clearing Auth0 session');
    
    // Logout from Auth0
    try {
      await this.ensureInitialized();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: About to call Auth0 logout, returnTo:', AUTH0_CONFIG.logoutUri);
      await this.auth0Client!.logout({
        logoutParams: {
          returnTo: AUTH0_CONFIG.logoutUri
        }
      });
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Auth0 logout completed (this may not be visible due to redirect)');
    } catch (error) {
      console.error('[AuthService] Error during Auth0 logout:', error);
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: logout() failed with error:', error);
    }
  }

  /**
   * Get current access token from storage or Auth0 client
   * @returns string | null - Access token or null if not authenticated
   */
  async getToken(): Promise<string | null> {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: getToken() called');
    
    // Try to get from storage first
    const storedToken = getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_CONFIG.TOKEN_STORAGE);
    if (storedToken) {
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Token found in storage, length:', storedToken.length);
      return storedToken;
    }

    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: Token not in storage, fetching from Auth0');
    
    // If not in storage, try to get from Auth0 client
    try {
      await this.ensureInitialized();
      const token = await this.auth0Client!.getTokenSilently();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: Token retrieved from Auth0, length:', token?.length || 0);
      this.setToken(token);
      return token;
    } catch (error) {
      console.error('[AuthService] Error getting token from Auth0:', error);
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: getToken() failed:', error);
      return null;
    }
  }

  /**
   * Get current access token synchronously from storage only
   * Use this for synchronous operations like interceptors
   * @returns string | null - Access token or null if not authenticated
   */
  getTokenSync(): string | null {
    return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_CONFIG.TOKEN_STORAGE);
  }

  /**
   * Set access token in storage and emit event for MicroApps
   * @param token - Access token to store
   */
  private setToken(token: string): void {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: setToken() called, storing token in storage');
    setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, token, STORAGE_CONFIG.TOKEN_STORAGE);
    this.emitAuthEvent('token_updated', { token });
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: Token stored and token_updated event emitted');
  }

  /**
   * Check if user is authenticated
   * @returns boolean - True if user has valid token
   */
  async isAuthenticated(): Promise<boolean> {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: isAuthenticated() called');
    try {
      await this.ensureInitialized();
      const result = await this.auth0Client!.isAuthenticated();
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.log('[AuthService] 🔍 DEBUG: isAuthenticated() result from Auth0:', result);
      return result;
    } catch (error) {
      console.error('[AuthService] Error checking authentication status:', error);
      // Fallback to checking storage
      const hasToken = !!getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_CONFIG.TOKEN_STORAGE);
      // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
      console.error('[AuthService] 🔍 DEBUG: isAuthenticated() failed, falling back to storage check:', hasToken);
      return hasToken;
    }
  }

  /**
   * Check if user is authenticated synchronously
   * Only checks storage, doesn't verify with Auth0
   * @returns boolean - True if user has token in storage
   */
  isAuthenticatedSync(): boolean {
    return !!getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, STORAGE_CONFIG.TOKEN_STORAGE);
  }

  /**
   * Get current user information
   * @returns UserInfo | null - Current user or null if not authenticated
   */
  getUser(): UserInfo | null {
    return this.userSubject.value;
  }

  /**
   * Get simplified user data from token
   * Extracts user details, role, and organization from ID token claims
   * Checks both top-level claims and namespaced custom claims
   * @returns UserData | null - Simplified user data or null if not authenticated
   */
  getUserData(): UserData | null {
    const userInfo = this.getUser();
    if (!userInfo) {
      return null;
    }

    const role = this.extractClaimValue(userInfo, 'role', 'user');
    const org = this.extractClaimValue(userInfo, ['org', 'organization'], 'default');

    return {
      id: userInfo.sub,
      name: userInfo.name || userInfo.email || 'User',
      email: userInfo.email || '',
      role,
      org
    };
  }

  /**
   * Extract claim value from user info, checking both direct properties and namespaced custom claims
   * @param userInfo - User info object
   * @param claimNames - Single claim name or array of claim names to search for
   * @param defaultValue - Default value if claim is not found
   * @returns Extracted claim value or default value
   */
  private extractClaimValue(userInfo: UserInfo, claimNames: string | string[], defaultValue: string): string {
    const names = Array.isArray(claimNames) ? claimNames : [claimNames];
    
    // Check direct properties first
    for (const name of names) {
      const directValue = (userInfo as any)[name];
      if (directValue) {
        return directValue;
      }
    }
    
    // Check namespaced custom claims
    const customClaims = this.getCustomClaims(userInfo);
    
    for (const name of names) {
      const matchingClaim = customClaims.find(claim => 
        claim.toLowerCase().includes(name.toLowerCase())
      );
      
      if (matchingClaim && userInfo[matchingClaim]) {
        const value = userInfo[matchingClaim];
        return Array.isArray(value) ? value[0] : value;
      }
    }
    
    return defaultValue;
  }

  /**
   * Get user information from storage
   * @returns UserInfo | null - Stored user info or null
   */
  private getUserInfoFromStorage(): UserInfo | null {
    const userJson = getStorageItem(STORAGE_KEYS.USER_INFO, STORAGE_CONFIG.USER_INFO_STORAGE);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Set user information in storage, update observable and emit event for MicroApps
   * Logs all Auth0 claims for debugging
   * @param userInfo - User information to store
   */
  private setUserInfo(userInfo: UserInfo): void {
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: setUserInfo() called');
    
    setStorageItem(
      STORAGE_KEYS.USER_INFO, 
      JSON.stringify(userInfo), 
      STORAGE_CONFIG.USER_INFO_STORAGE
    );
    this.userSubject.next(userInfo);
    
    // Log stored user info with all claims
    console.log('[AuthService] 💾 User info stored in sessionStorage:');
    console.log('  Standard claims:', {
      sub: userInfo.sub,
      name: userInfo.name,
      email: userInfo.email,
      email_verified: userInfo.email_verified
    });
    
    // Log Auth0 custom claims if present (namespaced with http:// or https://)
    const customClaims = this.getCustomClaims(userInfo);
    if (customClaims.length > 0) {
      console.log('  Custom claims stored:');
      customClaims.forEach(claim => {
        console.log(`    • ${claim}:`, userInfo[claim]);
      });
    }
    
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: User info stored in storage and userSubject updated');
    
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
    // TODO_REMOVE_DEBUG: Temporary debug log - remove after debugging
    console.log('[AuthService] 🔍 DEBUG: emitAuthEvent() called, event type:', event.type);
    this.eventBus.sendEvent(JSON.stringify(event));
    console.log('[AuthService] Auth event emitted:', event.type);
  }
}
