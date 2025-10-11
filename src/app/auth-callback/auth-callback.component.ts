import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@org/core-services';
import { firstValueFrom } from 'rxjs';

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
    // Use window.location.search for hash-based routing fallback
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    // Try Angular queryParams first
    const params:Params = await firstValueFrom(this.route.queryParams);
    if (params && Object.keys(params).length > 0) {
      code = params['code'] ?? null;
      state = params['state'] ?? null;
      error = params['error'] ?? null;
    } else {
      // Fallback for hash-based routing: parse window.location.search
      const urlParams = new URLSearchParams(window.location.search);
      code = urlParams.get('code');
      state = urlParams.get('state');
      error = urlParams.get('error');
    }

    // if (error) {
    //   this.message = `Authentication failed: ${error}`;
    //   this.isProcessing = false;
    //   setTimeout(() => this.router.navigate(['/']), 3000);
    //   return;
    // }

    // if (code && state) {
    //   try {
    //     const success = await this.authService.handleCallback(code, state);
    //     if (success) {
    //       this.message = 'Authentication successful! Redirecting...';
    //       this.isProcessing = false;
    //       setTimeout(() => this.router.navigate(['/']), 1500);
    //     } else {
    //       this.message = 'Authentication failed. Redirecting...';
    //       this.isProcessing = false;
    //       setTimeout(() => this.router.navigate(['/']), 3000);
    //     }
    //   } catch (e) {
    //     this.message = 'Authentication failed (exception). Redirecting...';
    //     this.isProcessing = false;
    //     setTimeout(() => this.router.navigate(['/']), 3000);
    //   }
    // } else {
    //   this.message = 'Invalid callback parameters. Redirecting...';
    //   this.isProcessing = false;
    //   setTimeout(() => this.router.navigate(['/']), 3000);
    // }
  }
}
