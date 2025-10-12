import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole, hasRequiredRole } from '../models/roles.model';

/**
 * Service to manage user roles and permissions
 */
@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize with dummy user for development
    this.loadDummyUser();
  }

  /**
   * Load dummy user based on session or default
   */
  private loadDummyUser(): void {
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    } else {
      // Default to sales executive for demo
      const defaultUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.ORG_ADMIN
      };
      this.setCurrentUser(defaultUser);
    }
  }

  /**
   * Set the current user
   * @param user User to set as current
   */
  setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    if (user) {
      sessionStorage.setItem('current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('current_user');
    }
  }

  /**
   * Get the current user synchronously
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get the current user's role
   * @returns Current user's role or null
   */
  getCurrentUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  /**
   * Check if current user has required role
   * @param requiredRole Minimum required role
   * @returns true if user has sufficient privilege
   */
  hasRole(requiredRole: UserRole): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;
    return hasRequiredRole(currentRole, requiredRole);
  }

  /**
   * Check if current user is admin or team lead
   * @returns true if user can view other users' data
   */
  canViewOthersData(): boolean {
    const role = this.getCurrentUserRole();
    return role === UserRole.SUPER_ADMIN || 
           role === UserRole.ORG_ADMIN || 
           role === UserRole.TEAM_LEAD;
  }
}
