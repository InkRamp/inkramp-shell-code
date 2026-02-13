import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

interface AuthState {
  message: string;
  isProcessing: boolean;
  redirectDelayMs: number;
}

/**
 * Auth callback component
 * NOTE: Auth functionality disabled - migrate to @opensourcekd/ng-common-libs
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
  message = 'Authentication disabled - redirecting...';
  isProcessing = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.warn('[AuthCallbackComponent] Auth services disabled');
  }

  async ngOnInit(): Promise<void> {
    // Immediately redirect to home since auth is disabled
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
