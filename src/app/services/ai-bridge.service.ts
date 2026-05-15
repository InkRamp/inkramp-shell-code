import { Injectable, InjectionToken, OnDestroy, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs';
import { MessageBridgeService } from './message-bridge.service';

/** Message shape sent by the AI iframe via postMessage. */
export interface AiMessage {
  type: string;
  payload?: unknown;
}

/** Configuration for AIBridgeService. */
export interface AiBridgeConfig {
  /** Origin the AI iframe is hosted on. Only messages from this origin are accepted. */
  trustedOrigin: string;
  /**
   * Maximum allowed serialised message size in characters (≈ bytes for ASCII).
   * Messages exceeding this limit are silently discarded. Default: 64 000.
   */
  maxPayloadSize?: number;
}

/** Injection token for AIBridgeService runtime configuration. */
export const AI_BRIDGE_CONFIG = new InjectionToken<AiBridgeConfig>('AI_BRIDGE_CONFIG');

/** Safe fallback used when no {@link AI_BRIDGE_CONFIG} token is provided. */
export const DEFAULT_AI_BRIDGE_CONFIG: AiBridgeConfig = {
  trustedOrigin: 'https://InkRamp.github.io',
  maxPayloadSize: 64_000,
};

/**
 * AIBridgeService — concrete implementation of {@link MessageBridgeService}.
 *
 * Bridges postMessage communication between the AI iframe and the rest of the
 * application via EventBus.
 *
 * Design principles:
 * - MFEs subscribe only to EventBus events (e.g. `ai:message`, `ai:action`).
 *   They have NO dependency on this service.
 * - This service owns the `window.message` listener and translates iframe
 *   postMessage events into EventBus emissions.
 * - The trusted origin and payload size limit are configurable via the
 *   {@link AI_BRIDGE_CONFIG} injection token — no code changes required when
 *   switching AI providers or environments.
 * - Registered in bootstrap.ts as `{ provide: MessageBridgeService, useClass: AIBridgeService }`
 *   to ensure a single application-wide singleton.
 */
@Injectable()
export class AIBridgeService extends MessageBridgeService implements OnDestroy {
  private readonly eventBus = inject(EventBus);
  private readonly config: AiBridgeConfig =
    inject(AI_BRIDGE_CONFIG, { optional: true }) ?? DEFAULT_AI_BRIDGE_CONFIG;

  private iframeRef: HTMLIFrameElement | null = null;
  private readonly boundHandler = this.onMessage.bind(this);

  /** Register the AI iframe element and start listening for its messages. */
  override connect(iframe: HTMLIFrameElement): void {
    this.iframeRef = iframe;
    window.addEventListener('message', this.boundHandler);
  }

  /** Unregister the iframe and stop listening. */
  override disconnect(): void {
    window.removeEventListener('message', this.boundHandler);
    this.iframeRef = null;
  }

  /**
   * Send a structured message to the AI iframe.
   * @param message - Message object with `type` and optional `payload`.
   */
  override sendToAi(message: AiMessage): void {
    if (!this.iframeRef?.contentWindow) {
      console.warn('[AIBridgeService] sendToAi called but iframe is not connected');
      return;
    }
    this.iframeRef.contentWindow.postMessage(message, this.config.trustedOrigin);
  }

  /**
   * Handles inbound postMessage events from the AI iframe.
   * Validates origin, message shape, namespace prefix, and payload size before
   * re-emitting on the EventBus so MFEs can subscribe without knowing about the bridge.
   */
  private onMessage(event: MessageEvent): void {
    // 1. Reject messages from untrusted origins
    if (event.origin !== this.config.trustedOrigin) {
      return;
    }

    const data = event.data as AiMessage;

    // 2. Validate message shape
    if (!data?.type || typeof data.type !== 'string') {
      return;
    }

    // 3. Only forward messages that carry the "ai:" namespace
    if (!data.type.startsWith('ai:')) {
      return;
    }

    // 4. Guard against oversized payloads
    const maxSize = this.config.maxPayloadSize ?? 64_000;
    const serialised = JSON.stringify(data.payload ?? null);
    if (serialised.length > maxSize) {
      console.warn(
        `[AIBridgeService] Discarding "${data.type}": payload size ${serialised.length} exceeds limit of ${maxSize}`
      );
      return;
    }

    this.eventBus.emit(data.type, data.payload);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
