import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole, hasRequiredRole } from './models/roles.model';
import { UserInfo } from './auth.service';

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
   * Set user from Zitadel authentication
   * Maps Zitadel UserInfo to internal User model with role
   * @param userInfo User information from Zitadel
   */
  setUserFromAuth(userInfo: UserInfo): void {
    console.log('[RoleService] Setting user from Zitadel auth:', userInfo);
    
    const user = this.mapUserInfoToUser(userInfo);
    console.log('[RoleService] Mapped user with role:', user);
    this.setCurrentUser(user);
  }

  /**
   * Pure function to map UserInfo to User with role assignment
   * @param userInfo User information from Zitadel
   * @returns Mapped User object with assigned role
   */
  private mapUserInfoToUser(userInfo: UserInfo): User {
    return {
      id: userInfo.sub,
      name: userInfo.name || userInfo.email || 'User',
      email: userInfo.email || '',
      role: this.determineRoleFromEmail(userInfo.email || '')
    };
  }

  /**
   * Pure function to determine user role from email pattern
   * @param email User email address
   * @returns Assigned UserRole based on email pattern
   */
  private determineRoleFromEmail(email: string): UserRole {
    const normalizedEmail = email.toLowerCase();
    
    const rolePatterns: Array<{ patterns: string[]; role: UserRole }> = [
      { patterns: ['admin', 'super'], role: UserRole.SUPER_ADMIN },
      { patterns: ['manager', 'org'], role: UserRole.ORG_ADMIN },
      { patterns: ['lead', 'team'], role: UserRole.TEAM_LEAD }
    ];

    const matchedRole = rolePatterns.find(({ patterns }) =>
      patterns.some(pattern => normalizedEmail.includes(pattern))
    );

    return matchedRole?.role ?? UserRole.SALES_EXECUTIVE;
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
      // Default to org admin for demo (matches sales data)
      const defaultUser: User = {
        id: 'user-1',
        name: 'John Admin',
        email: 'john.admin@company.com',
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

  /**
   * 
   * From this point everything is taken from mfe-MY_SALES
   */


  /**
   * Get users that current user can view
   * - Admins and team leads can view all users
   * - Sales executives can only view themselves
   * @returns Array of users that current user can view
   */
  getViewableUsers(): User[] {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return [];

    const allUsers = this.getAllUsers();

    if (this.isTeamLeadOrHigher()) {
      return allUsers.filter(u => u.role === UserRole.SALES_EXECUTIVE || u.id === currentUser.id);
    }

    return allUsers.filter(u => u.id === currentUser.id);
  }

    /**
   * Check if current user has any of the specified roles
   * @param roles - Array of roles to check
   * @returns true if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if current user is admin (super-admin or org-admin)
   * @returns true if user is an admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
  }

  /**
   * Check if current user is team lead or higher
   * @returns true if user is team lead or admin
   */
  isTeamLeadOrHigher(): boolean {
    return this.hasAnyRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.TEAM_LEAD]);
  }
  
  /**
   * Get all dummy users for testing/demo purposes
   * @returns Array of dummy users
   */
  getAllUsers(): User[] {
    return [
      {
        id: 'user-1',
        name: 'John Admin',
        email: 'john.admin@company.com',
        role: UserRole.SUPER_ADMIN
      },
      {
        id: 'user-2',
        name: 'Sarah Manager',
        email: 'sarah.manager@company.com',
        role: UserRole.ORG_ADMIN
      },
      {
        id: 'user-3',
        name: 'Mike Lead',
        email: 'mike.lead@company.com',
        role: UserRole.TEAM_LEAD,
        teamId: 'team-1'
      },
      {
        id: 'user-4',
        name: 'Alice Sales',
        email: 'alice.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      },
      {
        id: 'user-5',
        name: 'Bob Sales',
        email: 'bob.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      },
      {
        id: 'user-6',
        name: 'Carol Sales',
        email: 'carol.sales@company.com',
        role: UserRole.SALES_EXECUTIVE,
        teamId: 'team-1',
        managerId: 'user-3'
      }
    ];
  }

}

  