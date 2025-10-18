import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Params, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@org/core-services'; 
import { AuthenticationService } from './services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RoleService, MfeLoaderService } from '@org/core-services';
import { MFE_CONFIGS } from '../configs/mfe';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

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
export class AppComponent implements OnInit {
  title = 'Incentive Management System';

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

  async ngOnInit(): Promise<void> {
    // Check if user is already authenticated
    if (this.auth.isAuthenticated()) {
      const userInfo = this.auth.getUser();
      const currentUser = this.roleService.getCurrentUser();
      // Only set user from auth if no current user or if the IDs differ
      if (userInfo && (!currentUser || currentUser.id !== userInfo.sub)) {
        this.roleService.setUserFromAuth(userInfo);
      }
    }

    // Use window.location.search for hash-based routing fallback
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    // Try Angular queryParams first
    const params: Params = await firstValueFrom(this.route.queryParams);
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

    // Auth callback handling
    if (error) {
      console.error('Authentication failed:', error);
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    if (code && state) {
      try {
        const success = await this.auth.handleCallback(code, state);
        if (success) {
          console.log('Authentication successful');
          // Get user info from auth service and set it in role service
          const userInfo = this.auth.getUser();
          if (userInfo) {
            this.roleService.setUserFromAuth(userInfo);
          }
          setTimeout(() => this.router.navigate(['/']), 1500);
        } else {
          console.error('Authentication failed');
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      } catch (e) {
        console.error('Authentication failed (exception):', e);
        setTimeout(() => this.router.navigate(['/']), 3000);
      }
    }
  }
}
