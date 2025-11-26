import { TestBed } from '@angular/core/testing';

import { EventBusService, EventPayload } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('emit() and on()', () => {
    it('should emit and receive events with payload', (done) => {
      const testPayload = { userId: '123', name: 'John' };
      
      service.on('user:updated', (data) => {
        expect(data).toEqual(testPayload);
        done();
      });

      service.emit('user:updated', testPayload);
    });

    it('should emit events without payload', (done) => {
      service.on('user:logout', (data) => {
        expect(data).toBeUndefined();
        done();
      });

      service.emit('user:logout');
    });

    it('should return unsubscribe function', () => {
      let callCount = 0;
      const unsubscribe = service.on('test:event', () => {
        callCount++;
      });

      service.emit('test:event', {});
      expect(callCount).toBe(1);

      unsubscribe();
      service.emit('test:event', {});
      // Should still be 1 after unsubscribe
      expect(callCount).toBe(1);
    });

    it('should only receive events for subscribed type', (done) => {
      let receivedEvents: string[] = [];
      
      service.on('event:a', () => {
        receivedEvents.push('a');
      });

      service.on('event:b', () => {
        receivedEvents.push('b');
        expect(receivedEvents).toEqual(['a', 'b']);
        done();
      });

      service.emit('event:a', {});
      service.emit('event:b', {});
    });
  });

  describe('on$()', () => {
    it('should provide observable subscription for events', (done) => {
      const testPayload = { value: 42 };

      service.on$('test:observable').subscribe((data) => {
        expect(data).toEqual(testPayload);
        done();
      });

      // Give the subscription time to set up
      setTimeout(() => {
        service.emit('test:observable', testPayload);
      }, 0);
    });
  });

  describe('sendEvent() backward compatibility', () => {
    it('should still work with sendEvent for string events', (done) => {
      service.onePlusNEvents.subscribe((event) => {
        if (event === 'legacy:event') {
          done();
        }
      });

      service.sendEvent('legacy:event');
    });
  });
});
