import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserInfo } from '@opensourcekd/ng-common-libs';
import { RoleService, DummyDataService, MfeLoaderService, User, SalesExecutive, MfeConfig, UserProfileService, UserProfileData } from '@org/core-services';
import { Subscription } from 'rxjs';

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
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  userProfile: UserProfileData | null = null;
  availableMfes: MfeConfig[] = [];
  salesExecutives: SalesExecutive[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private roleService: RoleService,
    private dummyDataService: DummyDataService,
    private mfeLoader: MfeLoaderService,
    private auth: AuthService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.syncAuthenticatedUser();
    this.subscribeToUserChanges();
    this.subscribeToProfileChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Sync authenticated user from auth service to role service if needed
   * Also fetches user profile from API for organization and role data
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

    // Fetch user profile from API if authenticated
    if (isAuthenticated) {
      this.fetchUserProfile();
    }
  }

  /**
   * Fetch user profile from backend API
   * Note: Profile updates are handled via subscribeToProfileChanges() subscription
   */
  private fetchUserProfile(): void {
    const sub = this.userProfileService.fetchUserProfile().subscribe({
      next: (profile) => {
        if (profile) {
          this.roleService.setUserFromProfile(profile);
        }
      },
      error: (error) => {
        console.error('[HeaderComponent] Error fetching user profile:', error);
      }
    });
    this.subscriptions.add(sub);
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
    const sub = this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateComponentState(user);
    });
    this.subscriptions.add(sub);
  }

  /**
   * Subscribe to user profile changes from UserProfileService
   * This ensures the header updates reactively when profile is fetched after auth callback
   */
  private subscribeToProfileChanges(): void {
    const sub = this.userProfileService.profile$.subscribe(profile => {
      this.userProfile = profile;
    });
    this.subscriptions.add(sub);
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
    this.userProfile = null;
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
    this.userProfileService.clearProfile();
  }

  /**
   * Handle login action
   * Checks for invitation parameters in URL and passes them to Auth0 if present
   */
  login(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const params = urlTree.queryParams;
    
    const invitation = params['invitation'];
    const organization = params['organization'];

    if (invitation && organization) {
      this.auth.login(undefined, {
        invitation,
        organization
      });
    } else {
      this.auth.login();
    }
  }

  /**
   * Get organization display name from API profile
   */
  getOrganizationName(): string {
    if (this.userProfile?.organizations?.length) {
      return this.userProfile.organizations[0].displayName;
    }
    return '';
  }
}
