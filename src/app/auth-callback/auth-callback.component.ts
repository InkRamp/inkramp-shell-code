import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RoleService } from '@org/core-services';

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
    this.route.queryParams.subscribe(async params => {
      const { state, code, error } = params;
      
      if (error) {
        this.message = `Authentication failed: ${error}`;
        this.isProcessing = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
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
            setTimeout(() => this.router.navigate(['/']), 1500);
          } else {
            this.message = 'Authentication failed. Redirecting...';
            this.isProcessing = false;
            setTimeout(() => this.router.navigate(['/']), 3000);
          }
        } catch (e) {
          this.message = 'Authentication failed (exception). Redirecting...';
          this.isProcessing = false;
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      } else {
        this.message = 'Invalid callback parameters. Redirecting...';
        this.isProcessing = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
      }
    });
  }
}
