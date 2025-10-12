import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Params, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@org/core-services'; 
import { AuthenticationService , UserProfile } from './services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MfeWrapperComponent } from './components/mfe-wrapper/mfe-wrapper.component';
import { firstValueFrom } from 'rxjs';
import { RoleService } from './services/role.service';
import { DummyDataService } from './services/dummy-data.service';
import { MfeLoaderService } from './services/mfe-loader.service';
import { User, UserRole } from './models/roles.model';
import { MfeConfig } from './models/mfe.model';
import { SalesExecutive } from './models/data.model';
import { MFE_CONFIGS } from '../configs/mfe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, MfeWrapperComponent, FormsModule],
  standalone:true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Incentive Management System';
  
  currentUser: User | null = null;
  availableMfes: MfeConfig[] = [];
  salesExecutives: SalesExecutive[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;

  // Legacy properties for backward compatibility
  user: UserProfile | null = null;
  mfe1:string = "pokemon";
  isAuthenticated = false;
  userInfo: any = null;
  message = 'Processing authentication...';
  isProcessing = true;

  constructor(
    public auth2: AuthenticationService, 
    private auth:AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private dummyDataService: DummyDataService,
    private mfeLoader: MfeLoaderService
  ){
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }

  async ngOnInit(): Promise<void> {
    // Subscribe to current user changes
    this.roleService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.selectedSalesExecutiveId = user.id;
        this.canViewOthers = this.roleService.canViewOthersData();
        this.updateAvailableMfes();
        this.loadSalesExecutives();
        this.preloadMfes();
      }
    });

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
    //     const success = await this.auth.handleCallback(code, state);
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
   * Load sales executives for selection
   */
  private loadSalesExecutives(): void {
    if (this.canViewOthers) {
      this.salesExecutives = this.dummyDataService.getSalesExecutives();
    }
  }

  /**
   * Preload priority MFEs
   */
  private async preloadMfes(): Promise<void> {
    if (!this.currentUser) return;
    
    try {
      await this.mfeLoader.preloadPriorityMfes(this.currentUser.role);
    } catch (error) {
      console.error('[AppComponent] Error preloading MFEs:', error);
    }
  }

  /**
   * Handle sales executive selection change
   */
  onSalesExecutiveChange(): void {
    // Store selected executive in session for MFEs to use
    sessionStorage.setItem('selected_sales_executive_id', this.selectedSalesExecutiveId);
    // Emit event for MFEs to react to selection change
    window.dispatchEvent(new CustomEvent('salesExecutiveChanged', { 
      detail: { salesExecutiveId: this.selectedSalesExecutiveId } 
    }));
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
    this.roleService.setCurrentUser(null);
  }

  fetchUser() {
    // Legacy method for backward compatibility
  }
}
