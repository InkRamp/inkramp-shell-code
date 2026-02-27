import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EventBus, AuthService, TokenPayload } from '@opensourcekd/ng-common-libs';
import { MFE_CONFIGS } from '../configs/mfe';

interface OrgRolesTokenPayload extends TokenPayload {
  org_and_roles?: Record<string, string[]>;
}

/**
 * Root application component
 * NOTE: Auth/Role/MFE services removed - functionality moved to @opensourcekd/ng-common-libs
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule, FormsModule, HeaderComponent, FooterComponent],
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Incentive Management System';
  private subscriptions = new Subscription();
  private eventBus = inject(EventBus);
  private authService = inject(AuthService);
  private ngZone = inject(NgZone);

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ){
    console.log('[AppComponent] Initialized');
  }

  async ngOnInit(): Promise<void> {
    console.log('[AppComponent] ngOnInit');
    console.log('[AppComponent] EventBus id:', this.eventBus.getId());
    console.log('[AppComponent] AuthService id:', this.authService.getId());

    // auth:login_success: AuthService.handleCallback() has already used history.replaceState
    // (via cleanupCallbackUrl) to strip only the auth-specific params (code, state) from the URL
    // while preserving all other query params. Use ngZone.run() to force Angular change detection
    // without an additional redirect. Navigate to returnTo only when the login flow explicitly
    // recorded a target route via appState.
    this.subscriptions.add(
      this.eventBus.on<{ appState?: { returnTo?: string } }>('auth:login_success').subscribe((payload) => {
        console.log('[AppComponent] auth:login_success received');
        this.ngZone.run(() => {
          const returnTo = payload?.appState?.returnTo;
          if (returnTo) {
            this.router.navigate([returnTo], { replaceUrl: true });
          } else {
            const firstRoute = this.getFirstAvailableRoute();
            if (firstRoute) {
              this.router.navigate([firstRoute], { replaceUrl: true });
            }
          }
        });
      })
    );

    // On logout, navigate home inside NgZone so Angular detects the state change.
    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() => {
        console.log('[AppComponent] auth:logout received, navigating to home');
        this.ngZone.run(() => {
          this.router.navigate(['/'], { replaceUrl: true });
        });
      })
    );

    // On login failure, run inside NgZone to trigger change detection without redirecting.
    // Do not navigate — any non-auth query params in the URL are preserved.
    this.subscriptions.add(
      this.eventBus.on<{ error: string }>('auth:login_failure').subscribe((payload) => {
        console.error('[AppComponent] auth:login_failure received:', payload?.error);
        this.ngZone.run(() => {
          // No navigation — change detection fires from ngZone.run()
        });
      })
    );

    // Handle the OAuth2 redirect callback when Auth0 returns with ?code=.
    // handleCallback() internally strips auth params via history.replaceState and
    // emits auth:login_success / auth:login_failure via EventBus — no redirect needed here.
    if (window.location.search.includes('code=')) {
      try {
        await this.authService.handleCallback();
      } catch (error) {
        // handleCallback() handles its own errors and emits auth:login_failure via EventBus.
        // Do not redirect — preserves any non-auth query params already in the URL.
        console.error('[AppComponent] Auth callback failed:', error);
      }
    }
  }

  /** Returns the highest-priority route the current user has access to, or null if none. */
  private getFirstAvailableRoute(): string | null {
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    if (!token?.org_and_roles) return null;
    const userRoles = Object.values(token.org_and_roles).flat();
    const sorted = MFE_CONFIGS
      .filter(mfe => mfe.allowedRoles.some(role => userRoles.includes(role)))
      .sort((a, b) => b.priority - a.priority);
    return sorted.length > 0 ? `/${sorted[0].route}` : null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
