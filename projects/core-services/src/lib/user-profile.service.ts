import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

/**
 * Organization information from API
 */
export interface Organization {
  id: string;
  name: string;
  displayName: string;
}

/**
 * Role information from API
 */
export interface Role {
  id: string;
  name: string;
  description: string;
}

/**
 * User profile data from /auth/me API
 */
export interface UserProfileData {
  userId: string;
  email: string;
  name: string;
  nickname: string;
  picture: string;
  emailVerified: boolean;
  organizations: Organization[];
  roles: Role[];
  permissions: string[];
}

/**
 * API response structure
 */
export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfileData;
  timestamp: string;
  statusCode: number;
}

/**
 * User Profile Service
 * Fetches user profile including organization and role information from backend API
 */
@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly API_BASE_URL = 'https://5rkqypjiml.execute-api.us-east-1.amazonaws.com';
  
  private profileSubject = new BehaviorSubject<UserProfileData | null>(null);
  public profile$: Observable<UserProfileData | null> = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('[UserProfileService] Service initialized');
  }

  /**
   * Fetch user profile from /auth/me endpoint
   * Requires valid authentication token in Authorization header
   */
  fetchUserProfile(): Observable<UserProfileData | null> {
    console.log('[UserProfileService] Fetching user profile from API');
    
    return this.http.get<UserProfileResponse>(`${this.API_BASE_URL}/auth/me`).pipe(
      tap(response => {
        console.log('[UserProfileService] Profile response received:', response);
      }),
      map(response => {
        if (response.success && response.data) {
          this.profileSubject.next(response.data);
          return response.data;
        }
        return null;
      }),
      catchError(error => {
        console.error('[UserProfileService] Error fetching profile:', error);
        this.profileSubject.next(null);
        return of(null);
      })
    );
  }

  /**
   * Get current cached profile
   */
  getCurrentProfile(): UserProfileData | null {
    return this.profileSubject.value;
  }

  /**
   * Get user's primary organization
   */
  getPrimaryOrganization(): Organization | null {
    const profile = this.profileSubject.value;
    return profile?.organizations?.[0] || null;
  }

  /**
   * Get user's primary role
   */
  getPrimaryRole(): Role | null {
    const profile = this.profileSubject.value;
    return profile?.roles?.[0] || null;
  }

  /**
   * Get user's role name
   */
  getRoleName(): string | null {
    return this.getPrimaryRole()?.name || null;
  }

  /**
   * Get user's organization display name
   */
  getOrganizationDisplayName(): string | null {
    return this.getPrimaryOrganization()?.displayName || null;
  }

  /**
   * Clear cached profile
   */
  clearProfile(): void {
    this.profileSubject.next(null);
  }
}
