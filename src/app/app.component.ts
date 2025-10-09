import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@org/core-services'; 
import { AuthenticationService , UserProfile } from './services/authentication.service';
import { CommonModule } from '@angular/common';
import { MfeWrapperComponent } from './components/mfe-wrapper/mfe-wrapper.component';

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
  constructor(
    public auth2: AuthenticationService, 
    private auth:AuthService
  ){
    //console.log("In constructor of shell",this.auth.id)
  }

  ngOnInit(): void {
    console.log("IN ngOnInit of i17e");
    this.isAuthenticated = this.auth.isAuthenticated();
    this.userInfo = this.auth.getUser();
    
    // Subscribe to user changes
    this.auth.user$.subscribe(user => {
      this.userInfo = user;
      this.isAuthenticated = !!user;
    });
  }
  // ngOnInit() {
  //   this.fetchUser();
  // }

  login() {
    //this.auth.login();
  }

  logout() {
    //this.auth.logout();
  }

  fetchUser() {
    // this.auth.getUserProfile().subscribe(profile => {
    //   //console.log("MAKA",profile)
    //   return this.user = profile
    // });
  }
}
