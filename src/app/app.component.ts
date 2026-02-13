import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * Root application component
 * NOTE: Auth/Role/MFE services removed - functionality moved to @opensourcekd/ng-common-libs
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
    private router: Router,
    private route: ActivatedRoute
  ){
    console.log('[AppComponent] Initialized (auth/role/mfe services disabled)');
  }

  async ngOnInit(): Promise<void> {
    console.log('[AppComponent] ngOnInit (minimal functionality)');
    // NOTE: Auth and MFE initialization disabled - migrate to @opensourcekd/ng-common-libs
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
