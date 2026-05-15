import { TestBed } from '@angular/core/testing';
import { EventBus } from '@opensourcekd/ng-common-libs';
import { AIBridgeService, AiBridgeConfig, AiMessage, AI_BRIDGE_CONFIG, DEFAULT_AI_BRIDGE_CONFIG } from './ai-bridge.service';
import { MessageBridgeService } from './message-bridge.service';

const TRUSTED_ORIGIN = 'https://InkRamp.github.io';

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

  const dispatchMessage = (data: AiMessage, origin = TRUSTED_ORIGIN): void => {
    const event = new MessageEvent('message', { data, origin });
    window.dispatchEvent(event);
  };

  beforeEach(() => {
    eventBusMock = jasmine.createSpyObj('EventBus', ['on', 'emit', 'getId']);

    TestBed.configureTestingModule({
      providers: [
        AIBridgeService,
        { provide: EventBus, useValue: eventBusMock },
        { provide: AI_BRIDGE_CONFIG, useValue: { trustedOrigin: TRUSTED_ORIGIN, maxPayloadSize: 64_000 } as AiBridgeConfig }
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

  it('should extend MessageBridgeService', () => {
    expect(service instanceof MessageBridgeService).toBeTrue();
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
        origin: TRUSTED_ORIGIN
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

    it('should discard messages whose payload exceeds maxPayloadSize', () => {
      const warnSpy = spyOn(console, 'warn');
      // Create a payload string that exceeds the 64 000 char limit
      const oversizedPayload = { data: 'x'.repeat(65_000) };
      dispatchMessage({ type: 'ai:message', payload: oversizedPayload });
      expect(eventBusMock.emit).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(jasmine.stringContaining('Discarding'));
    });

    it('should forward messages whose payload is within the size limit', () => {
      const okPayload = { data: 'x'.repeat(100) };
      dispatchMessage({ type: 'ai:message', payload: okPayload });
      expect(eventBusMock.emit).toHaveBeenCalledWith('ai:message', okPayload);
    });
  });

  describe('sendToAi (EventBus → iframe)', () => {
    it('should send a postMessage to the iframe contentWindow with the trusted origin', () => {
      service.connect(mockIframe);
      const msg: AiMessage = { type: 'ai:context', payload: { route: '/rules' } };
      service.sendToAi(msg);
      const spy = mockIframe.contentWindow!.postMessage as jasmine.Spy;
      expect(spy).toHaveBeenCalledWith(msg, TRUSTED_ORIGIN);
    });

    it('should warn and not throw when iframe is not connected', () => {
      const warnSpy = spyOn(console, 'warn');
      service.sendToAi({ type: 'ai:context' });
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('AI_BRIDGE_CONFIG injection token', () => {
    it('should use the injected trustedOrigin when validating messages', () => {
      // service is already configured with TRUSTED_ORIGIN — messages from another origin are rejected
      service.connect(mockIframe);
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'ai:message', payload: {} },
        origin: 'https://different-origin.com'
      }));
      expect(eventBusMock.emit).not.toHaveBeenCalled();
    });

    it('should use DEFAULT_AI_BRIDGE_CONFIG when no token is provided', () => {
      // Build a standalone service instance without providing AI_BRIDGE_CONFIG
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AIBridgeService,
          { provide: EventBus, useValue: eventBusMock }
        ]
      });
      const fallbackService = TestBed.inject(AIBridgeService);
      expect(fallbackService).toBeTruthy();
      // Sanity-check: verify the default trusted origin rejects an untrusted sender
      fallbackService.connect(mockIframe);
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: 'ai:message', payload: {} },
        origin: 'https://evil.com'
      }));
      expect(eventBusMock.emit).not.toHaveBeenCalled();
      fallbackService.disconnect();
    });

    it('should expose DEFAULT_AI_BRIDGE_CONFIG with expected shape', () => {
      expect(DEFAULT_AI_BRIDGE_CONFIG.trustedOrigin).toBe('https://InkRamp.github.io');
      expect(DEFAULT_AI_BRIDGE_CONFIG.maxPayloadSize).toBe(64_000);
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
