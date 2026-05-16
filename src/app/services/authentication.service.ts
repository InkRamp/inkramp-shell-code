import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
}
//import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';



@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly authBasePath = '/v1/auth';

  constructor(private http: HttpClient) {
    // DEBUG_LOG: AuthenticationService initialized
    console.log('[AuthenticationService] Service initialized');
  }

  login() {
    // DEBUG_LOG: Initiating login
    console.log('[AuthenticationService] login() called, redirecting to backend login endpoint');
    // Redirect to backend login endpoint
    window.location.href = `${this.authBasePath}/login`;
  }

  logout() {
    // DEBUG_LOG: Initiating logout
    console.log('[AuthenticationService] logout() called, redirecting to backend logout endpoint');
    // Redirect to backend logout endpoint
    window.location.href = `${this.authBasePath}/logout`;
  }

  getUserProfile(): Observable<UserProfile | null> {
    // DEBUG_LOG: Fetching user profile
    console.log('[AuthenticationService] getUserProfile() called, fetching from backend');
    // Fetch user profile from backend /auth/me
    return this.http.get<UserProfile | null>(`${this.authBasePath}/me`, { withCredentials: true });
  }
}
