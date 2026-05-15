import { Component, OnInit, OnDestroy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@InkRamp/ng-common-libs';
import { MessageBridgeService } from '../../services/message-bridge.service';
import { MFE_CONFIGS, OrgRolesTokenPayload, extractUserRoles, hasAiAssistantAccess } from '../../../configs/mfe';

const AI_ASSISTANT_URL = 'https://InkRamp.github.io/InkRamp/mfe-AI-CHATBOT/';

/**
 * Floating AI assistant widget.
 * Renders a toggle button and an iframe pointing to the AI MFE.
 * Visible only when the user is authenticated AND holds a role of org-lead or above.
 *
 * Communication between the iframe and the rest of the app is handled by
 * MessageBridgeService — MFEs subscribe to EventBus events and are unaware of
 * the bridge or the iframe.
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
  hasAiAccess = false;
  isOpen = false;
  routeAllowsAi = true;
  readonly aiUrl: SafeResourceUrl;

  private subscriptions = new Subscription();
  private authService = inject(AuthService);
  private eventBus = inject(EventBus);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);
  private bridge = inject(MessageBridgeService);
  private router = inject(Router);

  constructor() {
    this.aiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(AI_ASSISTANT_URL);
  }

  ngOnInit(): void {
    // Track route changes to honour per-route showAiAssistant config.
    this.routeAllowsAi = this.checkRouteAllowsAi(this.router.url);
    this.subscriptions.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
        this.routeAllowsAi = this.checkRouteAllowsAi((e as NavigationEnd).urlAfterRedirects);
        if (!this.routeAllowsAi) {
          this.isOpen = false;
        }
      })
    );

    // user$ covers the synchronous initial state (e.g. token already in sessionStorage).
    this.subscriptions.add(
      this.authService.user$.subscribe((user: UserInfo | null) => {
        this.isLoggedIn = !!user;
        this.hasAiAccess = user ? this.checkAiAccess() : false;
        if (!this.isLoggedIn || !this.hasAiAccess) {
          this.isOpen = false;
          this.bridge.disconnect();
        }
      })
    );

    // EventBus events cover out-of-zone changes (OAuth callback, logout, etc.).
    this.subscriptions.add(
      this.eventBus.on('auth:login_success').subscribe(() => {
        this.ngZone.run(() => {
          this.isLoggedIn = true;
          this.hasAiAccess = this.checkAiAccess();
        });
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:logout').subscribe(() => {
        this.isLoggedIn = false;
        this.hasAiAccess = false;
        this.isOpen = false;
        this.bridge.disconnect();
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:login_failure').subscribe(() => {
        this.isLoggedIn = false;
        this.hasAiAccess = false;
        this.isOpen = false;
        this.bridge.disconnect();
      })
    );

    this.subscriptions.add(
      this.eventBus.on('auth:session_expired').subscribe(() => {
        this.isLoggedIn = false;
        this.hasAiAccess = false;
        this.isOpen = false;
        this.bridge.disconnect();
      })
    );
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  /** Called when the iframe finishes loading — connects the MessageBridge. */
  onIframeLoad(iframe: HTMLIFrameElement): void {
    this.bridge.connect(iframe);
  }

  ngOnDestroy(): void {
    this.bridge.disconnect();
    this.subscriptions.unsubscribe();
  }

  /** Returns true when the current token grants AI assistant access (org-lead+). */
  private checkAiAccess(): boolean {
    const token = this.authService.getDecodedToken() as OrgRolesTokenPayload | null;
    return hasAiAssistantAccess(extractUserRoles(token));
  }

  /** Returns false only when the current route's MFE config explicitly disables the AI assistant. */
  private checkRouteAllowsAi(url: string): boolean {
    const segment = url.split('?')[0].replace(/^\//, '');
    const config = MFE_CONFIGS.find(mfe => mfe.route === segment);
    return config ? (config.showAiAssistant ?? true) : true;
  }
}

