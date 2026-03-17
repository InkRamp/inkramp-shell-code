import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import { AiAssistantComponent } from './ai-assistant.component';
import { AIBridgeService } from '../../services/ai-bridge.service';

describe('AiAssistantComponent', () => {
  let component: AiAssistantComponent;
  let fixture: ComponentFixture<AiAssistantComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let aiBridgeMock: jasmine.SpyObj<AIBridgeService>;
  let userSubject: Subject<UserInfo | null>;
  let loginSuccessSubject: Subject<unknown>;
  let logoutSubject: Subject<unknown>;
  let loginFailureSubject: Subject<unknown>;
  let sessionExpiredSubject: Subject<unknown>;

  const stubUser: UserInfo = { sub: 'u1', email: 'test@test.com', name: 'Test', role: 'org-admin' };

  beforeEach(async () => {
    userSubject = new Subject<UserInfo | null>();
    loginSuccessSubject = new Subject<unknown>();
    logoutSubject = new Subject<unknown>();
    loginFailureSubject = new Subject<unknown>();
    sessionExpiredSubject = new Subject<unknown>();

    authServiceMock = jasmine.createSpyObj('AuthService', ['getId']);
    authServiceMock.user$ = userSubject.asObservable() as any;

    eventBusMock = jasmine.createSpyObj('EventBus', ['on', 'emit', 'getId']);
    eventBusMock.on.and.callFake((event: string) => {
      switch (event) {
        case 'auth:login_success': return loginSuccessSubject.asObservable() as any;
        case 'auth:logout': return logoutSubject.asObservable() as any;
        case 'auth:login_failure': return loginFailureSubject.asObservable() as any;
        case 'auth:session_expired': return sessionExpiredSubject.asObservable() as any;
        default: return new Subject().asObservable() as any;
      }
    });

    aiBridgeMock = jasmine.createSpyObj('AIBridgeService', ['connect', 'disconnect', 'sendToAi']);

    await TestBed.configureTestingModule({
      imports: [AiAssistantComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock },
        { provide: AIBridgeService, useValue: aiBridgeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AiAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be visible when not logged in', () => {
    userSubject.next(null);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-assistant')).toBeNull();
  });

  it('should be visible after user$ emits a user', () => {
    userSubject.next(stubUser);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-assistant')).not.toBeNull();
  });

  it('should show the AI panel when toggle is called', () => {
    userSubject.next(stubUser);
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-panel--open')).not.toBeNull();
  });

  it('should hide the AI panel on second toggle call', () => {
    userSubject.next(stubUser);
    component.isOpen = true;
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-panel--open')).toBeNull();
  });

  it('should set isLoggedIn=true on auth:login_success', () => {
    loginSuccessSubject.next(null);
    expect(component.isLoggedIn).toBeTrue();
  });

  it('should clear state on auth:logout', () => {
    component.isLoggedIn = true;
    component.isOpen = true;
    logoutSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should clear state on auth:login_failure', () => {
    component.isLoggedIn = true;
    component.isOpen = true;
    loginFailureSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should clear state on auth:session_expired', () => {
    component.isLoggedIn = true;
    component.isOpen = true;
    sessionExpiredSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should close panel when user$ emits null', () => {
    component.isLoggedIn = true;
    component.isOpen = true;
    userSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should subscribe to EventBus auth events on init', () => {
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_success');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:logout');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_failure');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:session_expired');
  });

  it('should unsubscribe on destroy', () => {
    const spy = spyOn((component as any).subscriptions, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('should expose a SafeResourceUrl for the AI iframe', () => {
    const sanitizer = TestBed.inject(DomSanitizer);
    const expected = sanitizer.bypassSecurityTrustResourceUrl(
      'https://opensourcekd.github.io/all-mfe-builds/mfe-AI/'
    );
    // Both values should be SafeResourceUrl objects (not raw strings)
    expect(typeof component.aiUrl).not.toBe('string');
    expect(component.aiUrl).toBeTruthy();
  });

  describe('AIBridge wiring', () => {
    it('should connect the bridge when the iframe loads', () => {
      const iframe = document.createElement('iframe');
      component.onIframeLoad(iframe);
      expect(aiBridgeMock.connect).toHaveBeenCalledWith(iframe);
    });

    it('should disconnect the bridge on auth:logout', () => {
      component.isLoggedIn = true;
      logoutSubject.next(null);
      expect(aiBridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on auth:login_failure', () => {
      component.isLoggedIn = true;
      loginFailureSubject.next(null);
      expect(aiBridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on auth:session_expired', () => {
      component.isLoggedIn = true;
      sessionExpiredSubject.next(null);
      expect(aiBridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge when user$ emits null', () => {
      userSubject.next(null);
      expect(aiBridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(aiBridgeMock.disconnect).toHaveBeenCalled();
    });
  });
});
