import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import {
  MfeConfig,
  OrgRolesTokenPayload,
  extractUserRoles,
  filterMfesByRoles,
  filterMfesByRole,
  getSessionRole,
} from '../../../configs/mfe';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit, OnDestroy {
  currentUser: UserInfo | null = null;
  availableMfes: MfeConfig[] = [];

  private subscriptions = new Subscription();
  private authService = inject(AuthService);
  private eventBus = inject(EventBus);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe(user => this.updateState(user))
    );
    this.subscriptions.add(
      this.eventBus.on('auth:login_success').subscribe(() =>
        this.ngZone.run(() => this.updateState(this.authService.getUser()))
      )
    );
    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() =>
        this.ngZone.run(() => this.updateState(null))
      )
    );
    this.subscriptions.add(
      this.eventBus.on('auth:login_failure').subscribe(() =>
        this.ngZone.run(() => this.updateState(null))
      )
    );
    this.subscriptions.add(
      this.eventBus.on('auth:session_expired').subscribe(() =>
        this.ngZone.run(() => this.updateState(null))
      )
    );
  }

  private updateState(user: UserInfo | null): void {
    this.currentUser = user;
    if (!user) {
      this.availableMfes = [];
      return;
    }
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    const tokenRoles = extractUserRoles(token);
    this.availableMfes = tokenRoles.length
      ? filterMfesByRoles(tokenRoles)
      : filterMfesByRole(getSessionRole());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  login(): void {
    this.authService.login().catch(error => {
      console.error('[HomePageComponent] Login failed:', error);
    });
  }
}
