import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Params, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@org/core-services'; 
import { AuthenticationService , UserProfile } from './services/authentication.service';
import { CommonModule } from '@angular/common';
import { MfeWrapperComponent } from './components/mfe-wrapper/mfe-wrapper.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, MfeWrapperComponent],
  standalone:true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'shell-module';
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
  ){
    //console.log("In constructor of shell",this.auth.id)
  }

  // ngOnInit(): void {
  //   console.log("IN ngOnInit of i17e");
  //   this.isAuthenticated = this.auth.isAuthenticated();
  //   this.userInfo = this.auth.getUser();
    
  //   // Subscribe to user changes
  //   this.auth.user$.subscribe(user => {
  //     this.userInfo = user;
  //     this.isAuthenticated = !!user;
  //   });
  // }
  // ngOnInit() {
  //   this.fetchUser();
  // }
async ngOnInit(): Promise<void> {
    // Use window.location.search for hash-based routing fallback
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    // Try Angular queryParams first
    const params:Params = await firstValueFrom(this.route.queryParams);
    console.log("Hey Jude"," param =",params," code = ",params['code'])
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

    if (error) {
      this.message = `Authentication failed: ${error}`;
      this.isProcessing = false;
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }

    if (code && state) {
      try {
        const success = await this.auth.handleCallback(code, state);
        if (success) {
          this.message = 'Authentication successful! Redirecting...';
          this.isProcessing = false;
          setTimeout(() => this.router.navigate(['/']), 1500);
        } else {
          this.message = 'Authentication failed. Redirecting...';
          this.isProcessing = false;
          setTimeout(() => this.router.navigate(['/']), 3000);
        }
      } catch (e) {
        this.message = 'Authentication failed (exception). Redirecting...';
        this.isProcessing = false;
        setTimeout(() => this.router.navigate(['/']), 3000);
      }
    } else {
      this.message = 'Invalid callback parameters. Redirecting...';
      this.isProcessing = false;
      setTimeout(() => this.router.navigate(['/']), 3000);
    }
  }

  login() {
    this.auth.login();
  }

  logout() {
    this.auth.logout();
  }

  fetchUser() {
    // this.auth.getUserProfile().subscribe(profile => {
    //   //console.log("MAKA",profile)
    //   return this.user = profile
    // });
  }
}
