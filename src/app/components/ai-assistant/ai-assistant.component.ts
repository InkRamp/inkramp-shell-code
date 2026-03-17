import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';

const AI_ASSISTANT_URL = 'https://opensourcekd.github.io/all-mfe-builds/mfe-AI/';

/**
 * Floating AI assistant widget.
 * Renders a toggle button and an iframe pointing to the AI MFE.
 * Visible only when the user is authenticated.
 */
@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss'
})
export class AiAssistantComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  isOpen = false;
  readonly aiUrl: SafeResourceUrl;

  private subscriptions = new Subscription();
  private authService = inject(AuthService);
  private eventBus = inject(EventBus);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);

  constructor() {
    this.aiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(AI_ASSISTANT_URL);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe((user: UserInfo | null) => {
        this.isLoggedIn = !!user;
        if (!user) {
          this.isOpen = false;
        }
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:login_success').subscribe(() => {
        this.ngZone.run(() => {
          this.isLoggedIn = true;
        });
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() => {
        this.isLoggedIn = false;
        this.isOpen = false;
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:login_failure').subscribe(() => {
        this.isLoggedIn = false;
        this.isOpen = false;
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:session_expired').subscribe(() => {
        this.isLoggedIn = false;
        this.isOpen = false;
      })
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
