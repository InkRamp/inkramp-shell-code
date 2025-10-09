// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface TokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of pokemon';

  // Zitadel configuration
  private readonly ISSUER_BASE_URL = 'https://topfix-wrczmn.us1.zitadel.cloud';
  private readonly CLIENT_ID = '336777344075263315';
  private readonly REDIRECT_URI = 'https://opensourcekd.github.io/pokemon/#/auth-callback';
  private readonly SCOPE = 'openid profile email';
  private readonly TOKEN_KEY = 'zitadel_token';
  private readonly USER_INFO_KEY = 'zitadel_user_info';

  private userSubject = new BehaviorSubject<UserInfo | null>(this.getUserInfoFromStorage());
  public user$: Observable<UserInfo | null> = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log("In constructor of auth service in pokemon");
  }

  login(user?: string) {
    if (user) {
      console.log(`[AuthService] Logged in: ${user}`);
    }
    this.redirectToZitadelLogin();
  }

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

  async handleCallback(code: string, state: string): Promise<boolean> {
    const storedState = sessionStorage.getItem('oauth_state');
    
    if (state !== storedState) {
      console.error('State mismatch - possible CSRF attack');
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
      
      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

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
      console.error('Error decoding ID token:', error);
      return { sub: '' };
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_INFO_KEY);
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): UserInfo | null {
    return this.userSubject.value;
  }

  private getUserInfoFromStorage(): UserInfo | null {
    const userJson = localStorage.getItem(this.USER_INFO_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  private setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(userInfo));
    this.userSubject.next(userInfo);
  }

  private generateRandomState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
