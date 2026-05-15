import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { OrgRolesTokenPayload, extractUserRoles, getHighestPriorityRoute } from '../../../configs/mfe';

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
    const route = getHighestPriorityRoute(extractUserRoles(token));
    if (route) {
      this.router.navigate([route]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
