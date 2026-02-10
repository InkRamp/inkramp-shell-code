import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@opensourcekd/ng-common-libs';

interface AuthState {
  message: string;
  isProcessing: boolean;
  redirectDelayMs: number;
}

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
export class AuthCallbackComponent implements OnInit {
  message = 'Processing authentication...';
  isProcessing = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.processAuthCallback();
  }

  /**
   * Process authentication callback - minimal version
   */
  private async processAuthCallback(): Promise<void> {
    try {
      const result = await this.authService.handleCallback();
      const authState = result.success 
        ? this.handleAuthSuccess(result.appState)
        : this.createFailureState();

      this.applyAuthState(authState);
      this.scheduleRedirect(authState.redirectDelayMs, result.appState);
    } catch (error) {
      console.error('[AuthCallbackComponent] Error processing callback:', error);
      const authState = this.createExceptionState();
      this.applyAuthState(authState);
      this.scheduleRedirect(authState.redirectDelayMs);
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(appState?: any): AuthState {
    const userInfo = this.authService.getUser();
    
    if (userInfo) {
      console.log('[AuthCallbackComponent] Authentication successful!');
      console.log('  User ID:', userInfo.sub);
      console.log('  Name:', userInfo.name);
      console.log('  Email:', userInfo.email);
    }

    return {
      message: 'Authentication successful! Redirecting...',
      isProcessing: false,
      redirectDelayMs: 1500
    };
  }

  /**
   * Create state for authentication failure
   */
  private createFailureState(): AuthState {
    return {
      message: 'Authentication failed. Redirecting...',
      isProcessing: false,
      redirectDelayMs: 3000
    };
  }

  /**
   * Create state for exception case
   */
  private createExceptionState(): AuthState {
    return {
      message: 'Authentication failed (exception). Redirecting...',
      isProcessing: false,
      redirectDelayMs: 3000
    };
  }

  /**
   * Apply authentication state to component
   */
  private applyAuthState(state: AuthState): void {
    this.message = state.message;
    this.isProcessing = state.isProcessing;
  }

  /**
   * Schedule redirect to home page
   */
  private scheduleRedirect(delayMs: number, appState?: any): void {
    setTimeout(() => {
      if (appState?.returnTo) {
        console.log('[AuthCallbackComponent] Restoring original URL parameters:', appState.returnTo);
        this.router.navigateByUrl('/' + appState.returnTo);
      } else {
        this.router.navigate(['/']);
      }
    }, delayMs);
  }
}
