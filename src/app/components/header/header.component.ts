import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, UserInfo } from '@opensourcekd/ng-common-libs';

/**
 * Stub interfaces for disabled functionality
 */
interface StubProfile { organizations?: Array<{ displayName?: string }>; }
interface StubMfe { remoteName?: string; displayName?: string; route?: string; }
interface StubSalesExecutive { id?: string; name?: string; }

/**
 * Header component for the application
 * Login/logout functionality enabled via AuthService
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
  userProfile: StubProfile | null = null;
  availableMfes: StubMfe[] = [];
  salesExecutives: StubSalesExecutive[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;
  private subscriptions = new Subscription();
  private authService = inject(AuthService);

  constructor(
    private router: Router
  ) {
    console.log('[HeaderComponent] Initialized with AuthService');
  }

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        this.currentUser = user;
        console.log('[HeaderComponent] User state changed:', user?.email || 'Not logged in');
      })
    );
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

  getOrganizationName(): string {
    return '';
  }
}
