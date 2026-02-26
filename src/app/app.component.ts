import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { EventBus, AuthService } from '@opensourcekd/ng-common-libs';

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

    // Subscribe to auth events for cross-zone state synchronization.
    // auth:login_success fires after a successful OAuth callback — navigate to the
    // return URL (or home) so that Angular's Router (which runs inside NgZone)
    // triggers change detection and shows the navigation immediately.
    this.subscriptions.add(
      this.eventBus.on<{ appState?: { returnTo?: string } }>('auth:login_success').subscribe((payload) => {
        console.log('[AppComponent] auth:login_success received, navigating to home');
        const returnTo = payload?.appState?.returnTo || '/';
        this.router.navigate([returnTo], { replaceUrl: true });
      })
    );

    // On logout, redirect to home so the shell re-evaluates auth state.
    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() => {
        console.log('[AppComponent] auth:logout received, navigating to home');
        this.router.navigate(['/'], { replaceUrl: true });
      })
    );

    // On login failure, stay on home so the user can retry.
    this.subscriptions.add(
      this.eventBus.on<{ error: string }>('auth:login_failure').subscribe((payload) => {
        console.error('[AppComponent] auth:login_failure received:', payload?.error);
        this.router.navigate(['/'], { replaceUrl: true });
      })
    );

    // Handle the OAuth2 redirect callback when Auth0 returns with ?code=.
    // After handleCallback() the auth:login_success event above will fire and
    // trigger a Router.navigate(), which runs inside NgZone and forces
    // Angular change detection so the navigation bar appears without a refresh.
    if (window.location.search.includes('code=')) {
      try {
        await this.authService.handleCallback();
      } catch (error) {
        console.error('[AppComponent] Auth callback failed:', error);
        this.router.navigate(['/'], { replaceUrl: true });
      }
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
