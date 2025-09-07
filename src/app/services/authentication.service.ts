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

  constructor(private http: HttpClient) {}

  login() {
    // Redirect to backend login endpoint
    window.location.href = 'http://localhost:4000/auth/login';
  }

  logout() {
    // Redirect to backend logout endpoint
    window.location.href = 'http://localhost:4000/auth/logout';
  }

  getUserProfile(): Observable<UserProfile | null> {
    // Fetch user profile from backend /auth/me
    return this.http.get<UserProfile | null>('http://localhost:4000/auth/me', { withCredentials: true });
  }
}