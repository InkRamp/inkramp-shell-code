import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService, DummyDataService, MfeLoaderService, User, SalesExecutive, MfeConfig, UserInfo } from '@org/core-services';
import { AuthService } from '@org/core-services';

/**
 * Header component for the application
 * Displays user information, role-based navigation, and user selection for admins
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  availableMfes: MfeConfig[] = [];
  salesExecutives: SalesExecutive[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;

  constructor(
    private roleService: RoleService,
    private dummyDataService: DummyDataService,
    private mfeLoader: MfeLoaderService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.syncAuthenticatedUser();
    this.subscribeToUserChanges();
  }

  /**
   * Sync authenticated user from auth service to role service if needed
   */
  private syncAuthenticatedUser(): void {
    const isAuthenticated = this.auth.isAuthenticatedSync();
    const userInfo = this.auth.getUser();
    const currentUser = this.roleService.getCurrentUser();
    
    const shouldSync = isAuthenticated && 
                      userInfo && 
                      this.shouldUpdateUser(currentUser, userInfo);
    
    if (shouldSync) {
      this.roleService.setUserFromAuth(userInfo);
    }
  }

  /**
   * Pure function to determine if user should be updated
   */
  private shouldUpdateUser(currentUser: User | null, userInfo: UserInfo): boolean {
    return !currentUser || currentUser.id !== userInfo.sub;
  }

  /**
   * Subscribe to user changes and update component state
   */
  private subscribeToUserChanges(): void {
    this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateComponentState(user);
    });
  }

  /**
   * Update component state based on current user
   */
  private updateComponentState(user: User | null): void {
    if (!user) {
      this.resetComponentState();
      return;
    }

    this.selectedSalesExecutiveId = user.id;
    this.canViewOthers = this.roleService.canViewOthersData();
    this.updateAvailableMfes();
    this.loadSalesExecutives();
  }

  /**
   * Reset component state when no user
   */
  private resetComponentState(): void {
    this.availableMfes = [];
    this.salesExecutives = [];
    this.canViewOthers = false;
  }

  /**
   * Update available MFEs based on current user role
   */
  private updateAvailableMfes(): void {
    this.availableMfes = this.currentUser 
      ? this.mfeLoader.getConfigsForRole(this.currentUser.role)
      : [];
  }

  /**
   * Load sales executives for selection (admin/team lead only)
   */
  private loadSalesExecutives(): void {
    this.salesExecutives = this.canViewOthers 
      ? this.dummyDataService.getSalesExecutives()
      : [];
  }

  /**
   * Handle sales executive selection change
   */
  onSalesExecutiveChange(): void {
    this.persistSelectedExecutive(this.selectedSalesExecutiveId);
    this.notifyExecutiveChange(this.selectedSalesExecutiveId);
  }

  /**
   * Persist selected executive to session storage
   */
  private persistSelectedExecutive(executiveId: string): void {
    sessionStorage.setItem('selected_sales_executive_id', executiveId);
  }

  /**
   * Notify other components of executive change via custom event
   */
  private notifyExecutiveChange(executiveId: string): void {
    window.dispatchEvent(new CustomEvent('salesExecutiveChanged', { 
      detail: { salesExecutiveId: executiveId } 
    }));
  }

  /**
   * Handle logout action
   */
  logout(): void {
    this.auth.logout();
    this.roleService.setCurrentUser(null);
  }

  /**
   * Handle login action
   */
  login(): void {
    this.auth.login();
  }
}
