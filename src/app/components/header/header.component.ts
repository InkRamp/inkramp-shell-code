import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
    private auth: AuthService,
    private router: Router
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
   * TEMPORARILY showing all MFEs for testing - role filtering disabled
   */
  private updateAvailableMfes(): void {
    // TODO: Re-enable role-based filtering when guards are restored
    // Original code: this.mfeLoader.getConfigsForRole(this.currentUser.role)
    this.availableMfes = this.currentUser 
      ? this.mfeLoader.getConfigs()  // Show ALL MFEs temporarily
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
   * Checks for invitation parameters in URL and passes them to Auth0 if present
   */
  login(): void {
    // Check if invitation parameters are present in the URL
    const urlTree = this.router.parseUrl(this.router.url);
    const params = urlTree.queryParams;
    
    const invitation = params['invitation'];
    const organization = params['organization'];

    // If invitation parameters exist, pass them to login
    if (invitation && organization) {
      console.log('[HeaderComponent] Invitation parameters detected, initiating invitation login');
      this.auth.login(undefined, {
        invitation,
        organization
      });
    } else {
      this.auth.login();
    }
  }
}
