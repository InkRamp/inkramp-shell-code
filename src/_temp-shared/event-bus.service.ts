import { Injectable } from '@angular/core';
import mitt, { EventType } from 'mitt';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  public onePlusNEvents!: ReplaySubject<EventType>;
  private emitter = mitt();

  constructor() {
    // DEBUG_LOG: EventBusService initialized
    console.log('[EventBusService] Service initialized');
    const e: Event = new Event('EventBusServiceCreated');
    this.onePlusNEvents = new ReplaySubject<EventType>(100);
    this.onePlusNEvents.next(e.type);
    this.emitter.on('*', (event: EventType) => {
      // DEBUG_LOG: Event received
      console.log('[EventBusService] Event received and forwarded to ReplaySubject:', event);
      this.onePlusNEvents.next(event);
    });
    // DEBUG_LOG: Event listener registered
    console.log('[EventBusService] Event listener registered for all events');
  }

  sendEvent(s: string) {
    // DEBUG_LOG: Sending event
    console.log('[EventBusService] sendEvent() called with:', s);
    this.emitter.emit(s);
    // DEBUG_LOG: Event emitted
    console.log('[EventBusService] Event emitted successfully');
  }
  
}
