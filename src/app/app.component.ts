import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Params, ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserInfo } from '@org/core-services'; 
import { AuthenticationService } from './services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoleService, MfeLoaderService, User } from '@org/core-services';
import { MFE_CONFIGS } from '../configs/mfe';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

interface AuthCallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

/**
 * Root application component
 * Initializes MFE configuration and manages authentication callback
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

  constructor(
    public auth2: AuthenticationService, 
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private mfeLoader: MfeLoaderService
  ){
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }

  // async ngOnInit(): Promise<void> {
  //   this.route.queryParams.subscribe(async (params: Record<string, string | null>)=>{
  //     const {state, code} = params;
  //     if(state && code) this.auth.handleCallback(code,state) 
  //   })
  // }

  ngOnInit(): void {
    this.syncAuthenticatedUser();
    this.subscribeToAuthCallback();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Sync authenticated user from auth service to role service if needed
   */
  private syncAuthenticatedUser(): void {
    const isAuthenticated = this.auth.isAuthenticated();
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
   * Subscribe to query parameters for authentication callback
   */
  private subscribeToAuthCallback(): void {
    const subscription = this.route.queryParams.subscribe((params: Record<string, string | null>) => {
      const authParams = this.extractAuthParams(params);
      this.handleAuthCallback(authParams);
    });
    
    this.subscriptions.add(subscription);
  }

  /**
   * Extract authentication parameters from route params
   */
  private extractAuthParams(params: Params): AuthCallbackParams {
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
   * Handle authentication callback logic
   */
  private handleAuthCallback(params: AuthCallbackParams): void {
    if (params.error) {
      this.handleAuthError(params.error);
      return;
    }

    if (params.code && params.state) {
      this.processAuthCode(params.code, params.state);
    }
  }

  /**
   * Handle authentication error
   */
  private handleAuthError(error: string): void {
    console.error('Authentication failed:', error);
    this.navigateWithDelay('/', 3000);
  }

  /**
   * Process authentication code and state
   */
  private async processAuthCode(code: string, state: string): Promise<void> {
    try {
      const success = await this.auth.handleCallback(code, state);
      success 
        ? this.handleAuthSuccess()
        : this.handleAuthFailure();
    } catch (e) {
      this.handleAuthException(e);
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(): void {
    console.log('Authentication successful');
    const userInfo = this.auth.getUser();
    
    if (userInfo) {
      this.roleService.setUserFromAuth(userInfo);
    }
    
    this.navigateWithDelay('/', 1500);
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    console.error('Authentication failed');
    this.navigateWithDelay('/', 3000);
  }

  /**
   * Handle authentication exception
   */
  private handleAuthException(error: unknown): void {
    console.error('Authentication failed (exception):', error);
    this.navigateWithDelay('/', 3000);
  }

  /**
   * Navigate to route after delay
   */
  private navigateWithDelay(route: string, delayMs: number): void {
    setTimeout(() => this.router.navigate([route]), delayMs);
  }
}
