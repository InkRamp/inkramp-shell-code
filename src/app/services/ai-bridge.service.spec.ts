import { TestBed } from '@angular/core/testing';
import { EventBus } from '@opensourcekd/ng-common-libs';
import { AIBridgeService, AiMessage } from './ai-bridge.service';

describe('AIBridgeService', () => {
  let service: AIBridgeService;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let mockIframe: HTMLIFrameElement;

  const makeIframe = (): HTMLIFrameElement => {
    const iframe = document.createElement('iframe');
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: jasmine.createSpy('postMessage') },
      writable: true
    });
    return iframe;
  };

  const dispatchMessage = (data: AiMessage, origin = 'https://opensourcekd.github.io'): void => {
    const event = new MessageEvent('message', { data, origin });
    window.dispatchEvent(event);
  };

  beforeEach(() => {
    eventBusMock = jasmine.createSpyObj('EventBus', ['on', 'emit', 'getId']);

    TestBed.configureTestingModule({
      providers: [
        AIBridgeService,
        { provide: EventBus, useValue: eventBusMock }
      ]
    });

    service = TestBed.inject(AIBridgeService);
    mockIframe = makeIframe();
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect / disconnect', () => {
    it('should add a message event listener on connect', () => {
      const spy = spyOn(window, 'addEventListener').and.callThrough();
      service.connect(mockIframe);
      expect(spy).toHaveBeenCalledWith('message', jasmine.any(Function));
    });

    it('should remove the message event listener on disconnect', () => {
      const spy = spyOn(window, 'removeEventListener').and.callThrough();
      service.connect(mockIframe);
      service.disconnect();
      expect(spy).toHaveBeenCalledWith('message', jasmine.any(Function));
    });
  });

  describe('inbound messages (iframe → EventBus)', () => {
    beforeEach(() => service.connect(mockIframe));

    it('should forward ai: prefixed messages to the EventBus', () => {
      dispatchMessage({ type: 'ai:message', payload: { text: 'Hello' } });
      expect(eventBusMock.emit).toHaveBeenCalledWith('ai:message', { text: 'Hello' });
    });

    it('should forward ai:action messages to the EventBus', () => {
      dispatchMessage({ type: 'ai:action', payload: { action: 'navigate' } });
      expect(eventBusMock.emit).toHaveBeenCalledWith('ai:action', { action: 'navigate' });
    });

    it('should ignore messages from untrusted origins', () => {
      const event = new MessageEvent('message', {
        data: { type: 'ai:message', payload: {} },
        origin: 'https://evil.example.com'
      });
      window.dispatchEvent(event);
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });

    it('should ignore messages without a type', () => {
      dispatchMessage({ type: '' });
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });

    it('should ignore messages with a non-string type', () => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 42 },
        origin: 'https://opensourcekd.github.io'
      }));
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });

    it('should ignore messages not prefixed with "ai:"', () => {
      dispatchMessage({ type: 'some:other:event', payload: {} });
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });

    it('should not forward messages after disconnect', () => {
      service.disconnect();
      dispatchMessage({ type: 'ai:message', payload: {} });
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });
  });

  describe('sendToAi (EventBus → iframe)', () => {
    it('should send a postMessage to the iframe contentWindow with the trusted origin', () => {
      service.connect(mockIframe);
      const msg: AiMessage = { type: 'ai:context', payload: { route: '/rules' } };
      service.sendToAi(msg);
      const spy = mockIframe.contentWindow!.postMessage as jasmine.Spy;
      expect(spy).toHaveBeenCalledWith(msg, 'https://opensourcekd.github.io');
    });

    it('should warn and not throw when iframe is not connected', () => {
      const warnSpy = spyOn(console, 'warn');
      service.sendToAi({ type: 'ai:context' });
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should call disconnect on destroy', () => {
      const spy = spyOn(service, 'disconnect').and.callThrough();
      service.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
