import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, TokenPayload } from '@InkRamp/ng-common-libs';
import { MFE_CONFIGS } from '../../../configs/mfe';

/**
 * Extended token payload including the org_and_roles custom claim.
 * Structure: { "hdfc": ["super-admin", "org-admin"], ... }
 */
interface OrgRolesTokenPayload extends TokenPayload {
  org_and_roles?: Record<string, string[]>;
}

/**
 * Home page component - landing page for the application.
 * Redirects authenticated users to their first available route.
 * Shows a login prompt for unauthenticated users.
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private hasRedirected = false;
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe(user => {
        this.isLoggedIn = !!user;
        if (user && !this.hasRedirected) {
          this.hasRedirected = true;
          this.redirectToFirstAvailableRoute();
        }
      })
    );
  }

  private redirectToFirstAvailableRoute(): void {
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    if (!token?.org_and_roles) return;
    const userRoles = Object.values(token.org_and_roles).flat();
    const availableMfes = MFE_CONFIGS
      .filter(mfe => mfe.allowedRoles.some(role => userRoles.includes(role)))
      .sort((a, b) => b.priority - a.priority);
    if (availableMfes.length > 0) {
      this.router.navigate(['/' + availableMfes[0].route]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
