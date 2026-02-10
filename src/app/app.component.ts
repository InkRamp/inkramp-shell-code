import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * Root application component - Minimal shell version
 * Handles basic Auth0 authentication without complex role/MFE logic
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
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ){
    console.log("App initialized with config:", APP_CONFIG);
  }

  async ngOnInit(): Promise<void> {
    // Minimal initialization - just handle auth callback if present
  }
}
