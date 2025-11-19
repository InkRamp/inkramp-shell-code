import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { AuthService, UserInfo } from '@org/core-services'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
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
    const params = await firstValueFrom(this.route.queryParams);

    const invitation = params['invitation'];
    const organization = params['organization'];

    // If invitation and organization parameters are present, initiate Auth0 login
    if (!invitation || !organization) {
      return;
    }

    this.logInvitationDetails(invitation, organization, params['organization_name']);

    const isAuthenticated = await this.auth.isAuthenticated();

    if (!isAuthenticated) {
      await this.initiateInvitationLogin(invitation, organization);
    } else {
      this.logAlreadyAuthenticated();
    }
  }

  /**
   * Log invitation details for debugging
   */
  private logInvitationDetails(invitation: string, organization: string, organizationName?: string): void {
    console.log('[AppComponent] Organization invitation detected');
    console.log('  Invitation:', invitation);
    console.log('  Organization:', organization);
    console.log('  Organization Name:', organizationName || 'Not specified');
  }

  /**
   * Initiate login with invitation parameters
   */
  private async initiateInvitationLogin(invitation: string, organization: string): Promise<void> {
    console.log('[AppComponent] User not authenticated, initiating login with invitation parameters...');
    await this.auth.login(undefined, {
      invitation,
      organization
    });
  }

  /**
   * Log that user is already authenticated
   */
  private logAlreadyAuthenticated(): void {
    console.log('[AppComponent] User already authenticated');
    console.log('[AppComponent] User may need to re-authenticate to accept invitation');
    // Optionally, you could trigger a re-authentication here
    // await this.auth.login(undefined, { invitation, organization });
  }
}
