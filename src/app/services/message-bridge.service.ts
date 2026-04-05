/**
 * Tech-agnostic abstract class for bridging postMessage communication between
 * an embedded iframe and the rest of the application via EventBus.
 *
 * Inject this token in components and services that need to send or receive
 * messages from an AI (or any) iframe panel.  The concrete implementation
 * (AIBridgeService) is wired in bootstrap.ts, keeping all consumers decoupled
 * from the underlying postMessage mechanics.
 *
 * MFEs must NEVER import this class.  They subscribe to EventBus events
 * (e.g. `ai:message`, `ai:action`) and are completely unaware of the bridge.
 */
export abstract class MessageBridgeService {
  /** Register the iframe element and begin accepting inbound messages. */
  abstract connect(iframe: HTMLIFrameElement): void;

  /** Deregister the iframe and stop listening for inbound messages. */
  abstract disconnect(): void;

  /**
   * Send a structured message to the connected iframe.
   * @param message - Message object with `type` and optional `payload`.
   */
  abstract sendToAi(message: { type: string; payload?: unknown }): void;
}
