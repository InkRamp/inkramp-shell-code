import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import { MfeConfig, OrgRolesTokenPayload, extractUserRoles, filterMfesByRole, filterMfesByRoles, getSessionRole } from '../../../configs/mfe';

/**
 * Header component for the application
 * Login/logout functionality enabled via AuthService from @opensourcekd/ng-common-libs
 * Navigation links are derived from MFE_CONFIGS filtered by the authenticated user's roles,
 * respecting the role hierarchy: super-admin > org-admin > org-lead > sales-executive.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: UserInfo | null = null;
  availableMfes: MfeConfig[] = [];
  salesExecutives: { id?: string; name?: string }[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;
  menuOpen = false;
  private subscriptions = new Subscription();
  private authService = inject(AuthService);
  private eventBus = inject(EventBus);
  private ngZone = inject(NgZone);

  constructor(
    private router: Router
  ) {
    console.log('[HeaderComponent] Initialized with AuthService and EventBus');
  }

  ngOnInit(): void {
    // Primary: subscribe to the user$ stream for state changes that happen
    // synchronously within Angular's zone (e.g. on page load from sessionStorage).
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        this.updateNavState(user);
        console.log('[HeaderComponent] user$ changed:', user?.email || 'Not logged in');
      })
    );

    // Secondary: subscribe to EventBus auth events so that state changes
    // originating outside Angular's zone (OAuth callback flow) are also caught.
    // The AppComponent navigates after login_success which re-enters the zone,
    // but these subscriptions provide an additional synchronization layer.
    this.subscriptions.add(
      this.eventBus.on('auth:login_success').subscribe(() => {
        const user = this.authService.getUser();
        this.ngZone.run(() => {
          console.log('[HeaderComponent] auth:login_success — refreshing nav for:', user?.email);
          this.updateNavState(user);
        });
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() => {
        this.ngZone.run(() => {
          console.log('[HeaderComponent] auth:logout — clearing nav');
          this.clearNavState();
        });
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:login_failure').subscribe(() => {
        this.ngZone.run(() => {
          console.warn('[HeaderComponent] auth:login_failure — clearing nav');
          this.clearNavState();
        });
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:session_expired').subscribe(() => {
        this.ngZone.run(() => {
          console.warn('[HeaderComponent] auth:session_expired — clearing nav');
          this.clearNavState();
        });
      })
    );
  }

  /** Update navigation state from a user info object (null = logged out). */
  private updateNavState(user: UserInfo | null): void {
    this.currentUser = user;
    this.availableMfes = user ? this.getAvailableMfes() : [];
  }

  /** Clear navigation state on logout, session expiry or login failure. */
  private clearNavState(): void {
    this.currentUser = null;
    this.availableMfes = [];
    this.menuOpen = false;
  }

  /**
   * Returns MFE configs accessible to the current user based on their roles.
   * Decoded token roles are primary; sessionStorage role is a compatibility fallback.
   */
  private getAvailableMfes(): MfeConfig[] {
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    const tokenRoles = extractUserRoles(token);
    return tokenRoles.length ? filterMfesByRoles(tokenRoles) : filterMfesByRole(getSessionRole());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    console.log('[HeaderComponent] Initiating login');
    this.authService.login().catch(error => {
      console.error('[HeaderComponent] Login failed:', error);
    });
  }

  logout(): void {
    console.log('[HeaderComponent] Initiating logout');
    this.authService.logout().catch(error => {
      console.error('[HeaderComponent] Logout failed:', error);
    });
  }

  onSalesExecutiveChange(): void {
    console.warn('[HeaderComponent] User selection disabled');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  getOrganizationName(): string {
    return '';
  }
}
