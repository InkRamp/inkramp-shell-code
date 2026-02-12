import { Injectable, inject } from '@angular/core';
import { EventBus } from '@opensourcekd/ng-common-libs/core';
import { Observable } from 'rxjs';

/**
 * EventBusService - Angular service wrapper for the opensourcekd EventBus
 * This service wraps the framework-agnostic EventBus from opensourcekd library
 * and provides Angular dependency injection support
 */
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private eventBus = inject(EventBus);

  constructor() {
    console.log('[EventBusService] Service initialized with opensourcekd EventBus');
  }

  /**
   * Send an event through the event bus
   * @param eventType - Type/name of the event
   * @param data - Optional data to send with the event
   */
  sendEvent(eventType: string, data?: any): void {
    console.log('[EventBusService] sendEvent() called with:', eventType, data);
    this.eventBus.emit(eventType, data);
    console.log('[EventBusService] Event emitted successfully');
  }

  /**
   * Subscribe to a specific event
   * @param eventType - Type/name of the event to listen for
   * @returns Observable that emits the event data
   */
  on<T = any>(eventType: string): Observable<T> {
    return this.eventBus.on<T>(eventType);
  }

  /**
   * Subscribe to all events
   * @returns Observable that emits all event payloads
   */
  onAll(): Observable<any> {
    return this.eventBus.onAll();
  }
}
