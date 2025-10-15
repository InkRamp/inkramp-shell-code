import { Injectable, NgZone } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SseFromEventService {
  constructor(private zone: NgZone) {}

  listen(): Observable<any> {
    const es = new EventSource('https://stream.wikimedia.org/v2/stream/recentchange');

    // Convert message events into an observable
    return fromEvent<MessageEvent>(es, 'message').pipe(
      map(event => {
        // Ensure Angular change detection runs
        let data: any;
        this.zone.run(() => data = event.data);
        return data;
      })
    );
  }
}
