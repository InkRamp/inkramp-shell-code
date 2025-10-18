import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RoleService, DummyDataService, MfeLoaderService, User, SalesExecutive, MfeConfig } from '@org/core-services';
import { AuthService } from '@org/core-services';

/**
 * Header component for the application
 * Displays user information, role-based navigation, and user selection for admins
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  availableMfes: MfeConfig[] = [];
  salesExecutives: SalesExecutive[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;

  constructor(
    private roleService: RoleService,
    private dummyDataService: DummyDataService,
    private mfeLoader: MfeLoaderService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is already authenticated via Zitadel
    if (this.auth.isAuthenticated()) {
      const userInfo = this.auth.getUser();
      const currentUser = this.roleService.getCurrentUser();
      // Only set user from auth if no current user or if the IDs differ
      if (userInfo && (!currentUser || currentUser.id !== userInfo.sub)) {
        this.roleService.setUserFromAuth(userInfo);
      }
    }

    this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.selectedSalesExecutiveId = user.id;
        this.canViewOthers = this.roleService.canViewOthersData();
        this.updateAvailableMfes();
        this.loadSalesExecutives();
      }
    });
  }

  /**
   * Update available MFEs based on current user role
   */
  private updateAvailableMfes(): void {
    if (!this.currentUser) {
      this.availableMfes = [];
      return;
    }
    this.availableMfes = this.mfeLoader.getConfigsForRole(this.currentUser.role);
  }

  /**
   * Load sales executives for selection (admin/team lead only)
   */
  private loadSalesExecutives(): void {
    if (this.canViewOthers) {
      this.salesExecutives = this.dummyDataService.getSalesExecutives();
    }
  }

  /**
   * Handle sales executive selection change
   */
  onSalesExecutiveChange(): void {
    sessionStorage.setItem('selected_sales_executive_id', this.selectedSalesExecutiveId);
    window.dispatchEvent(new CustomEvent('salesExecutiveChanged', { 
      detail: { salesExecutiveId: this.selectedSalesExecutiveId } 
    }));
  }

  /**
   * Handle logout action
   */
  logout(): void {
    this.auth.logout();
    this.roleService.setCurrentUser(null);
  }

  /**
   * Handle login action
   */
  login(): void {
    this.auth.login();
  }
}
