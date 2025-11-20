import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService, UserInfo } from '@org/core-services'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoleService, MfeLoaderService, User } from '@org/core-services';
import { MFE_CONFIGS } from '../configs/mfe';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * Root application component
 * Initializes MFE configuration, syncs authenticated user, and handles Auth0 organization invitations
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule, FormsModule, HeaderComponent, FooterComponent],
  standalone: true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Incentive Management System';
  private subscriptions = new Subscription();

  constructor(
    private auth: AuthService,
    private roleService: RoleService,
    private mfeLoader: MfeLoaderService,
    private router: Router
  ){
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }

  async ngOnInit(): Promise<void> {
    this.handleOrganizationInvitation();
    await this.syncAuthenticatedUser();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Sync authenticated user from auth service to role service if needed
   */
  private async syncAuthenticatedUser(): Promise<void> {
    const isAuthenticated = await this.auth.isAuthenticated();
    const userInfo = this.auth.getUser();
    const currentUser = this.roleService.getCurrentUser();
    
    const shouldSync = isAuthenticated && 
                      userInfo && 
                      this.shouldUpdateUser(currentUser, userInfo);
    
    if (shouldSync) {
      console.log('[AppComponent] Syncing authenticated user to role service');
      this.roleService.setUserFromAuth(userInfo);
    }
  }

  /**
   * Pure function to determine if user should be updated
   */
  private shouldUpdateUser(currentUser: User | null, userInfo: UserInfo): boolean {
    return !currentUser || currentUser.id !== userInfo.sub;
  }

  /**
   * Handle Auth0 organization invitation flow
   * When user clicks on invitation link with ?invitation=...&organization=... parameters,
   * automatically trigger login with these parameters so Auth0 can accept the invitation
   */
  private handleOrganizationInvitation(): void {
    // Check immediately for invitation parameters
    const urlTree = this.router.parseUrl(this.router.url);
    const params = urlTree.queryParams;
    
    const invitation = params['invitation'];
    const organization = params['organization'];

    if (invitation && organization) {
      console.log('[AppComponent] Organization invitation detected');
      console.log('  Invitation:', invitation);
      console.log('  Organization:', organization);
      console.log('  Organization Name:', params['organization_name'] || 'Not specified');
      console.log('[AppComponent] Automatically initiating login with invitation parameters...');
      
      // Immediately trigger login with invitation parameters
      // This will redirect to Auth0's invitation acceptance screen
      this.auth.login(undefined, {
        invitation,
        organization
      });
    }
  }
}
