import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RoleService } from '@org/core-services';
import { Subscription } from 'rxjs';

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
  private static readonly SUCCESS_REDIRECT_DELAY = 1500;
  private static readonly ERROR_REDIRECT_DELAY = 3000;

  message = 'Processing authentication...';
  isProcessing = true;
  private subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.subscription = this.route.queryParams.subscribe(async params => {
      const { state, code, error } = params;
      
      if (error) {
        this.message = `Authentication failed: ${error}`;
        this.isProcessing = false;
        setTimeout(() => this.router.navigate(['/']), AuthCallbackComponent.ERROR_REDIRECT_DELAY);
        return;
      }
      
      if (state && code) {
        try {
          const success = await this.authService.handleCallback(code, state);
          
          if (success) {
            const userInfo = this.authService.getUser();
            if (userInfo) {
              this.roleService.setUserFromAuth(userInfo);
            }
            this.message = 'Authentication successful! Redirecting...';
            this.isProcessing = false;
            setTimeout(() => this.router.navigate(['/']), AuthCallbackComponent.SUCCESS_REDIRECT_DELAY);
          } else {
            this.message = 'Authentication failed. Redirecting...';
            this.isProcessing = false;
            setTimeout(() => this.router.navigate(['/']), AuthCallbackComponent.ERROR_REDIRECT_DELAY);
          }
        } catch (e) {
          this.message = 'Authentication failed (exception). Redirecting...';
          this.isProcessing = false;
          setTimeout(() => this.router.navigate(['/']), AuthCallbackComponent.ERROR_REDIRECT_DELAY);
        }
      } else {
        this.message = 'Invalid callback parameters. Redirecting...';
        this.isProcessing = false;
        setTimeout(() => this.router.navigate(['/']), AuthCallbackComponent.ERROR_REDIRECT_DELAY);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
