import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserInfo } from '@opensourcekd/ng-common-libs';

/**
 * Header component - Minimal version
 * Only handles basic auth login/logout
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userInfo: UserInfo | null = null;
  isAuthenticated: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  /**
   * Check authentication status
   */
  private checkAuthStatus(): void {
    this.isAuthenticated = this.auth.isAuthenticatedSync();
    if (this.isAuthenticated) {
      this.userInfo = this.auth.getUser();
    }
  }

  /**
   * Handle logout action
   */
  logout(): void {
    this.auth.logout();
  }

  /**
   * Handle login action
   */
  login(): void {
    this.auth.login();
  }
}
