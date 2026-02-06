import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService, API_CONFIG } from '@opensourcekd/ng-common-libs'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoleService, MfeLoaderService, User, UserInfo } from '@org/core-services';
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
    private router: Router,
    private route: ActivatedRoute
  ){
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
    console.log("WAKA MOJO 2", API_CONFIG);
  }

  async ngOnInit(): Promise<void> {
    // await this.handleOrganizationInvitation();
    // await this.syncAuthenticatedUser();
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
   * 
   * Note: We always trigger login with invitation parameters, even if user appears authenticated,
   * because Auth0 needs to process the invitation acceptance flow.
   */
  private async handleOrganizationInvitation(): Promise<void> {
    // Try multiple approaches to get query parameters
    console.log('[AppComponent] handleOrganizationInvitation() called');
    
    // Approach 1: ActivatedRoute snapshot
    const routeParams = this.route.snapshot.queryParams;
    console.log('[AppComponent] Route snapshot queryParams:', routeParams);
    
    // Approach 2: Router state
    const routerParams = this.router.routerState.root.snapshot.queryParams;
    console.log('[AppComponent] Router state queryParams:', routerParams);
    
    // Approach 3: window.location (most reliable for initial load)
    const urlParams = new URLSearchParams(window.location.search);
    const windowInvitation = urlParams.get('invitation');
    const windowOrganization = urlParams.get('organization');
    const windowOrgName = urlParams.get('organization_name');
    console.log('[AppComponent] Window location search:', window.location.search);
    console.log('[AppComponent] URLSearchParams - invitation:', windowInvitation, 'organization:', windowOrganization);
    
    // Use window.location as the most reliable source
    const invitation = windowInvitation || routeParams['invitation'];
    const organization = windowOrganization || routeParams['organization'];

    if (invitation && organization) {
      console.log('[AppComponent] Organization invitation detected');
      console.log('  Invitation:', invitation);
      console.log('  Organization:', organization);
      console.log('  Organization Name:', windowOrgName || routeParams['organization_name'] || 'Not specified');
      console.log('[AppComponent] Automatically initiating login with invitation parameters...');
      
      // Immediately trigger login with invitation parameters
      // This will redirect to Auth0's invitation acceptance screen
      // We don't check if user is authenticated because Auth0 needs to process the invitation
      await this.auth.login(undefined, {
        invitation,
        organization
      });
    } else {
      console.log('[AppComponent] No invitation parameters found');
    }
  }
}
