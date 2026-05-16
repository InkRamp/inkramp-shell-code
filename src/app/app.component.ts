import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EventBus, AuthService } from '@opensourcekd/ng-common-libs';
import { OrgRolesTokenPayload, extractUserRoles, filterMfesByRoles, getFirstAvailableRoute, getSessionRole } from '../configs/mfe';

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
  title = 'InkRamp';
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
          const targetRoute = payload?.appState?.returnTo ?? this.getFirstAvailableRoute();
          if (targetRoute) {
            this.router.navigate([targetRoute], { replaceUrl: true });
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

  private getFirstAvailableRoute(): string | null {
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    const firstTokenMfe = filterMfesByRoles(extractUserRoles(token))[0];
    return firstTokenMfe ? `/${firstTokenMfe.route}` : getFirstAvailableRoute(getSessionRole());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
