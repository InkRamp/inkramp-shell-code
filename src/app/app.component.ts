import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
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
    private route: ActivatedRoute
  ){
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }

  async ngOnInit(): Promise<void> {
    await this.handleOrganizationInvitation();
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
  private async handleOrganizationInvitation(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      const invitation = params['invitation'];
      const organization = params['organization'];

      // If invitation and organization parameters are present, initiate Auth0 login
      if (invitation && organization) {
        console.log('[AppComponent] Organization invitation detected');
        console.log('  Invitation:', invitation);
        console.log('  Organization:', organization);
        console.log('  Organization Name:', params['organization_name'] || 'Not specified');

        // Check if user is already authenticated
        const isAuthenticated = await this.auth.isAuthenticated();

        if (!isAuthenticated) {
          console.log('[AppComponent] User not authenticated, initiating login with invitation parameters...');
          // Trigger login with invitation parameters
          // Auth0 will accept the invitation and add user to the organization
          await this.auth.login(undefined, {
            invitation,
            organization
          });
        } else {
          console.log('[AppComponent] User already authenticated');
          // If user is already authenticated, they may need to re-authenticate
          // to accept the invitation for a different/new organization
          console.log('[AppComponent] User may need to re-authenticate to accept invitation');
          // Optionally, you could trigger a re-authentication here
          // await this.auth.login(undefined, { invitation, organization });
        }
      }
    });
  }
}
