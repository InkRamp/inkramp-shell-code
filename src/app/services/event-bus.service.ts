import { Injectable } from '@angular/core';
import mitt, { EventType } from 'mitt';
import { BehaviorSubject, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventBusService {
  public onePlusNEvents!: ReplaySubject<EventType>;
  private emitter = mitt();

  constructor() {
    const e: Event = new Event('EventBusServiceCreated');
    this.onePlusNEvents = new ReplaySubject<EventType>(100);// (e.type);
    this.onePlusNEvents.next(e.type);
    this.emitter.on('*', (event) => this.onePlusNEvents.next(event));
  }

  sendEvent(s:string){
    this.emitter.emit(s)
  }
  
}

