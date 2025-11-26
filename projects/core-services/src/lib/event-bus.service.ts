import { Injectable } from '@angular/core';
import mitt, { EventType, Handler } from 'mitt';
import { ReplaySubject, Observable, filter, map } from 'rxjs';

/**
 * Event payload interface for typed events
 */
export interface EventPayload {
  type: string;
  data?: unknown;
}

@Injectable({ providedIn: 'root' })
export class EventBusService {
  public onePlusNEvents!: ReplaySubject<EventType>;
  private emitter = mitt();
  private handlers = new Map<string, Set<Handler>>();

  constructor() {
    // DEBUG_LOG: EventBusService initialized
    console.log('[EventBusService] Service initialized');
    const e: Event = new Event('EventBusServiceCreated');
    this.onePlusNEvents = new ReplaySubject<EventType>(100);
    this.onePlusNEvents.next(e.type);
    this.emitter.on('*', (event) => {
      // DEBUG_LOG: Event received
      console.log('[EventBusService] Event received and forwarded to ReplaySubject:', event);
      this.onePlusNEvents.next(event);
    });
    // DEBUG_LOG: Event listener registered
    console.log('[EventBusService] Event listener registered for all events');
  }

  /**
   * Emit an event with optional payload
   * @param event - Event name (e.g., 'user:updated')
   * @param payload - Optional data payload to send with the event
   */
  emit(event: string, payload?: unknown): void {
    console.log('[EventBusService] emit() called with:', event, payload);
    const eventPayload: EventPayload = { type: event, data: payload };
    this.emitter.emit(event, eventPayload);
    console.log('[EventBusService] Event emitted successfully');
  }

  /**
   * Subscribe to an event
   * @param event - Event name to subscribe to (e.g., 'user:updated')
   * @param handler - Callback function to handle the event
   * @returns Unsubscribe function
   */
  on(event: string, handler: (data: unknown) => void): () => void {
    console.log('[EventBusService] on() called for event:', event);
    
    const wrappedHandler: Handler = (eventPayload: unknown) => {
      const payload = eventPayload as EventPayload;
      if (payload && payload.type === event) {
        handler(payload.data);
      }
    };

    // Track handlers for cleanup
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(wrappedHandler);

    this.emitter.on(event, wrappedHandler);
    
    // Return unsubscribe function
    return () => {
      console.log('[EventBusService] Unsubscribing from event:', event);
      this.emitter.off(event, wrappedHandler);
      this.handlers.get(event)?.delete(wrappedHandler);
    };
  }

  /**
   * Subscribe to an event as an Observable
   * @param event - Event name to subscribe to
   * @returns Observable that emits event data
   */
  on$(event: string): Observable<unknown> {
    return this.onePlusNEvents.pipe(
      filter((e) => 
        typeof e === 'object' && e !== null && (e as unknown as EventPayload).type === event
      ),
      map((e) => (e as unknown as EventPayload).data)
    );
  }

  /**
   * @deprecated Use emit() instead. Kept for backward compatibility.
   */
  sendEvent(s: string) {
    // DEBUG_LOG: Sending event
    console.log('[EventBusService] sendEvent() called with:', s);
    this.emitter.emit(s);
    // DEBUG_LOG: Event emitted
    console.log('[EventBusService] Event emitted successfully');
  }
  
}
