import { Injectable, NgZone } from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SseControlService {
  private eventSource?: EventSource;

  constructor(private zone: NgZone) {}

  start(url: string): Observable<string> {
    this.eventSource = new EventSource(url);
    const es = this.eventSource;

    return new Observable<string>(observer => {
      const sub = fromEvent<MessageEvent>(es, 'message').subscribe(event => {
        this.zone.run(() => observer.next(event.data));
      });

      es.onerror = (err) => {
        this.zone.run(() => observer.error(err));
      };

      return () => {
        sub.unsubscribe();
        es.close();
      };
    });

  }

  stop() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }
}
