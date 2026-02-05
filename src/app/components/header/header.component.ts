import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService, MfeLoaderService, User, MfeConfig } from '@org/core-services';
import { AuthService, UserInfo } from '@opensourcekd/ng-common-libs';
import { Subscription } from 'rxjs';

/**
 * Header component for the application
 * Displays user information and role-based navigation
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
  availableMfes: MfeConfig[] = [];
  private subscriptions = new Subscription();

  constructor(
    private roleService: RoleService,
    private mfeLoader: MfeLoaderService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.syncAuthenticatedUser();
    this.subscribeToUserChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    const sub = this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateComponentState(user);
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

    this.updateAvailableMfes();
  }

  /**
   * Reset component state when no user
   */
  private resetComponentState(): void {
    this.availableMfes = [];
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
}
