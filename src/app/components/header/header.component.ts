import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Header component for the application
 * NOTE: Role/Auth/MFE services disabled - migrate to @opensourcekd/ng-common-libs
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  userProfile: any = null;
  availableMfes: any[] = [];
  salesExecutives: any[] = [];
  selectedSalesExecutiveId: string = '';
  canViewOthers: boolean = false;
  private subscriptions = new Subscription();

  constructor(
    private router: Router
  ) {
    console.warn('[HeaderComponent] Services disabled - migrate to @opensourcekd/ng-common-libs');
  }

  ngOnInit(): void {
    // NOTE: Auth/Role services disabled
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    console.warn('[HeaderComponent] Login disabled');
  }

  logout(): void {
    console.warn('[HeaderComponent] Logout disabled');
  }

  onSalesExecutiveChange(): void {
    console.warn('[HeaderComponent] User selection disabled');
  }

  getOrganizationName(): string {
    return '';
  }
}
