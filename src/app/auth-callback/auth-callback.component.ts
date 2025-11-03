import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RoleService } from '@org/core-services';
import { firstValueFrom } from 'rxjs';

interface AuthCallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

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
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  async ngOnInit(): Promise<void> {
    const authParams = await this.extractAuthParams();
    await this.processAuthCallback(authParams);
  }

  /**
   * Extract authentication parameters from route or URL
   */
  private async extractAuthParams(): Promise<AuthCallbackParams> {
    const params = await firstValueFrom(this.route.queryParams);
    const hasParams = params && Object.keys(params).length > 0;
    
    return hasParams 
      ? this.extractFromRouteParams(params)
      : this.extractFromUrlParams();
  }

  /**
   * Extract auth params from Angular route params
   */
  private extractFromRouteParams(params: Params): AuthCallbackParams {
    return {
      code: params['code'] ?? null,
      state: params['state'] ?? null,
      error: params['error'] ?? null
    };
  }

  /**
   * Extract auth params from URL search params (fallback for hash routing)
   */
  private extractFromUrlParams(): AuthCallbackParams {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error')
    };
  }

  /**
   * Process authentication callback based on params
   */
  private async processAuthCallback(params: AuthCallbackParams): Promise<void> {
    const authState = params.error
      ? this.createErrorState(params.error)
      : await this.processAuthCode(params);

    this.applyAuthState(authState);
    this.scheduleRedirect(authState.redirectDelayMs);
  }

  /**
   * Create auth state for error case
   */
  private createErrorState(error: string): AuthState {
    return {
      message: `Authentication failed: ${error}`,
      isProcessing: false,
      redirectDelayMs: 3000
    };
  }

  /**
   * Process authentication code and state
   */
  private async processAuthCode(params: AuthCallbackParams): Promise<AuthState> {
    const hasRequiredParams = params.code && params.state;
    
    if (!hasRequiredParams) {
      return this.createInvalidParamsState();
    }

    try {
      const success = await this.authService.handleCallback(params.code!, params.state!);
      return success 
        ? this.handleAuthSuccess()
        : this.createFailureState();
    } catch (e) {
      return this.createExceptionState();
    }
  }

  /**
   * Create state for invalid parameters
   */
  private createInvalidParamsState(): AuthState {
    return {
      message: 'Invalid callback parameters. Redirecting...',
      isProcessing: false,
      redirectDelayMs: 3000
    };
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(): AuthState {
    const userInfo = this.authService.getUser();
    
    if (userInfo) {
      this.roleService.setUserFromAuth(userInfo);
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
  private scheduleRedirect(delayMs: number): void {
    setTimeout(() => this.router.navigate(['/']), delayMs);
  }
}
