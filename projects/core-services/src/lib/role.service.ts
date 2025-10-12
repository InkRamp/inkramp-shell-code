import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole, hasRequiredRole } from './models/roles.model';

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
    // DEBUG_LOG: RoleService initialized
    console.log('[RoleService] Service initialized');
    // Initialize with dummy user for development
    this.loadDummyUser();
  }

  /**
   * Load dummy user based on session or default
   */
  private loadDummyUser(): void {
    // DEBUG_LOG: Loading user from session storage
    console.log('[RoleService] Loading user from session storage');
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // DEBUG_LOG: User loaded from session
      console.log('[RoleService] User loaded from session:', user);
      this.currentUserSubject.next(user);
    } else {
      // Default to sales executive for demo
      const defaultUser: User = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: UserRole.ORG_ADMIN
      };
      // DEBUG_LOG: No saved user, using default
      console.log('[RoleService] No saved user found, using default:', defaultUser);
      this.setCurrentUser(defaultUser);
    }
  }

  /**
   * Set the current user
   * @param user User to set as current
   */
  setCurrentUser(user: User | null): void {
    // DEBUG_LOG: Setting current user
    console.log('[RoleService] Setting current user:', user);
    this.currentUserSubject.next(user);
    if (user) {
      sessionStorage.setItem('current_user', JSON.stringify(user));
      // DEBUG_LOG: User saved to session
      console.log('[RoleService] User saved to session storage');
    } else {
      sessionStorage.removeItem('current_user');
      // DEBUG_LOG: User removed from session
      console.log('[RoleService] User removed from session storage');
    }
  }

  /**
   * Get the current user synchronously
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    // DEBUG_LOG: Getting current user
    console.log('[RoleService] getCurrentUser() called, returning:', user);
    return user;
  }

  /**
   * Get the current user's role
   * @returns Current user's role or null
   */
  getCurrentUserRole(): UserRole | null {
    const role = this.currentUserSubject.value?.role || null;
    // DEBUG_LOG: Getting current user role
    console.log('[RoleService] getCurrentUserRole() called, returning:', role);
    return role;
  }

  /**
   * Check if current user has required role
   * @param requiredRole Minimum required role
   * @returns true if user has sufficient privilege
   */
  hasRole(requiredRole: UserRole): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) {
      // DEBUG_LOG: No current role
      console.log('[RoleService] hasRole() - No current role, access denied');
      return false;
    }
    const hasAccess = hasRequiredRole(currentRole, requiredRole);
    // DEBUG_LOG: Role check result
    console.log(`[RoleService] hasRole() - Checking if ${currentRole} has ${requiredRole}:`, hasAccess);
    return hasAccess;
  }

  /**
   * Check if current user is admin or team lead
   * @returns true if user can view other users' data
   */
  canViewOthersData(): boolean {
    const role = this.getCurrentUserRole();
    const canView = role === UserRole.SUPER_ADMIN || 
           role === UserRole.ORG_ADMIN || 
           role === UserRole.TEAM_LEAD;
    // DEBUG_LOG: Can view others data check
    console.log(`[RoleService] canViewOthersData() - Role: ${role}, Can view:`, canView);
    return canView;
  }
}
