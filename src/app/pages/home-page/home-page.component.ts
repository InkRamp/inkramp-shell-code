import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MfeLoaderService, MfeConfig, AuthService } from '@org/core-services';

/**
 * Home page component that displays all available routes
 * For testing purposes - shows all MFEs regardless of role
 * Also handles Auth0 organization invitation flow
 */
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {
  allMfes: MfeConfig[] = [];

  constructor(
    private mfeLoader: MfeLoaderService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    // Get all MFE configurations without role filtering
    this.allMfes = this.mfeLoader.getConfigs();

    // Check for Auth0 organization invitation parameters
    await this.handleOrganizationInvitation();
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
        console.log('[HomePageComponent] Organization invitation detected');
        console.log('  Invitation:', invitation);
        console.log('  Organization:', organization);
        console.log('  Organization Name:', params['organization_name'] || 'Not specified');

        // Check if user is already authenticated
        const isAuthenticated = await this.authService.isAuthenticated();

        if (!isAuthenticated) {
          console.log('[HomePageComponent] User not authenticated, initiating login with invitation parameters...');
          // Trigger login with invitation parameters
          // Auth0 will accept the invitation and add user to the organization
          await this.authService.login(undefined, {
            invitation,
            organization
          });
        } else {
          console.log('[HomePageComponent] User already authenticated');
          // If user is already authenticated, they may need to re-authenticate
          // to accept the invitation for a different/new organization
          console.log('[HomePageComponent] User may need to re-authenticate to accept invitation');
          // Optionally, you could trigger a re-authentication here
          // await this.authService.login(undefined, { invitation, organization });
        }
      }
    });
  }
}
