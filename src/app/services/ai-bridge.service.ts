import { Injectable, OnDestroy, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs';

/** Trusted origin for the AI iframe. Only messages from this origin are accepted. */
const AI_TRUSTED_ORIGIN = 'https://opensourcekd.github.io';

/** Message shape sent by the AI iframe via postMessage. */
export interface AiMessage {
  type: string;
  payload?: unknown;
}

/**
 * AIBridgeService — bridges postMessage communication between the AI iframe
 * and the rest of the application via EventBus.
 *
 * Design principles:
 * - MFEs subscribe only to EventBus events (e.g. `ai:message`, `ai:action`).
 *   They have NO dependency on this service.
 * - This service owns the window.message listener and translates iframe
 *   postMessage events into EventBus emissions.
 * - Inbound messages from the iframe are re-emitted on the EventBus using
 *   the message `type` as the event name.
 * - Outbound messages to the iframe are sent via `sendToAi()`.
 */
@Injectable({ providedIn: 'root' })
export class AIBridgeService implements OnDestroy {
  private eventBus = inject(EventBus);
  private iframeRef: HTMLIFrameElement | null = null;
  private readonly boundHandler = this.onMessage.bind(this);

  /** Register the AI iframe element and start listening for its messages. */
  connect(iframe: HTMLIFrameElement): void {
    this.iframeRef = iframe;
    window.addEventListener('message', this.boundHandler);
    console.log('[AIBridgeService] Connected to AI iframe');
  }

  /** Unregister the iframe and stop listening. */
  disconnect(): void {
    window.removeEventListener('message', this.boundHandler);
    this.iframeRef = null;
    console.log('[AIBridgeService] Disconnected from AI iframe');
  }

  /**
   * Send a structured message to the AI iframe.
   * @param message - Message object with `type` and optional `payload`.
   */
  sendToAi(message: AiMessage): void {
    if (!this.iframeRef?.contentWindow) {
      console.warn('[AIBridgeService] sendToAi called but iframe is not connected');
      return;
    }
    this.iframeRef.contentWindow.postMessage(message, AI_TRUSTED_ORIGIN);
  }

  /**
   * Handles inbound postMessage events from the AI iframe.
   * Validates the message shape, then re-emits on the EventBus so MFEs
   * can subscribe without knowing about the bridge.
   */
  private onMessage(event: MessageEvent): void {
    // Reject messages from untrusted origins
    if (event.origin !== AI_TRUSTED_ORIGIN) {
      return;
    }
    const data = event.data as AiMessage;
    if (!data?.type || typeof data.type !== 'string') {
      return;
    }
    // Only forward messages that carry the "ai:" namespace
    if (!data.type.startsWith('ai:')) {
      return;
    }
    console.log(`[AIBridgeService] Forwarding "${data.type}" to EventBus`, data.payload);
    this.eventBus.emit(data.type, data.payload);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
