import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { AuthService } from '@opensourcekd/ng-common-libs';

/**
 * Auth callback component
 * Handles the OAuth2 redirect callback from Auth0
 */
@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
      <div style="text-align: center;">
        <h2>{{ message }}</h2>
        <p *ngIf="isProcessing">Processing authentication...</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `]
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  message = 'Processing authentication...';
  isProcessing = true;
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    if (window.location.search.includes('code=')) {
      try {
        const result = await this.authService.handleCallback();
        if (result.success) {
          this.message = 'Authentication successful! Redirecting...';
        } else {
          this.message = 'Authentication could not be completed. Redirecting to home...';
        }
      } catch (error) {
        console.error('[AuthCallbackComponent] Callback handling failed:', error);
        this.message = 'An error occurred during authentication. Please try logging in again.';
      }
    }
    this.isProcessing = false;
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
