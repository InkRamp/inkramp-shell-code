import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import { AiAssistantComponent } from './ai-assistant.component';
import { MessageBridgeService } from '../../services/message-bridge.service';
import { OrgRolesTokenPayload } from '../../../configs/mfe';

describe('AiAssistantComponent', () => {
  let component: AiAssistantComponent;
  let fixture: ComponentFixture<AiAssistantComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let bridgeMock: jasmine.SpyObj<MessageBridgeService>;
  let userSubject: Subject<UserInfo | null>;
  let loginSuccessSubject: Subject<unknown>;
  let logoutSubject: Subject<unknown>;
  let loginFailureSubject: Subject<unknown>;
  let sessionExpiredSubject: Subject<unknown>;

  /** Token granting admin role — has AI access. */
  const adminToken: OrgRolesTokenPayload = {
    org_and_roles: { 'test-org': ['admin'] }
  };
  /** Token granting buyer role — has AI access. */
  const buyerToken: OrgRolesTokenPayload = {
    org_and_roles: { 'test-org': ['buyer'] }
  };
  /** Token granting supplier role — has AI access. */
  const supplierToken: OrgRolesTokenPayload = {
    org_and_roles: { 'test-org': ['supplier'] }
  };

  const stubUser: UserInfo = { sub: 'u1', email: 'test@test.com', name: 'Test', role: 'admin' };

  beforeEach(async () => {
    userSubject = new Subject<UserInfo | null>();
    loginSuccessSubject = new Subject<unknown>();
    logoutSubject = new Subject<unknown>();
    loginFailureSubject = new Subject<unknown>();
    sessionExpiredSubject = new Subject<unknown>();

    authServiceMock = jasmine.createSpyObj('AuthService', ['getId', 'getDecodedToken']);
    authServiceMock.user$ = userSubject.asObservable() as any;
    // Default: return an admin token so AI is accessible
    authServiceMock.getDecodedToken.and.returnValue(adminToken);

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

    bridgeMock = jasmine.createSpyObj('MessageBridgeService', ['connect', 'disconnect', 'sendToAi']);

    await TestBed.configureTestingModule({
      imports: [AiAssistantComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock },
        { provide: MessageBridgeService, useValue: bridgeMock }
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

  it('should be visible after user$ emits a user with admin role', () => {
    authServiceMock.getDecodedToken.and.returnValue(adminToken);
    userSubject.next(stubUser);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-assistant')).not.toBeNull();
  });

  it('should NOT be visible after user$ emits a user with no recognized role', () => {
    authServiceMock.getDecodedToken.and.returnValue({ org_and_roles: { 'test-org': ['unknown-role'] } });
    userSubject.next(stubUser);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-assistant')).toBeNull();
  });

  it('should be visible for buyer role', () => {
    authServiceMock.getDecodedToken.and.returnValue(buyerToken);
    userSubject.next(stubUser);
    fixture.detectChanges();
    expect(component.hasAiAccess).toBeTrue();
  });

  it('should be visible for supplier role', () => {
    authServiceMock.getDecodedToken.and.returnValue(supplierToken);
    userSubject.next(stubUser);
    fixture.detectChanges();
    expect(component.hasAiAccess).toBeTrue();
  });

  it('should not grant AI access when token has no roles', () => {
    authServiceMock.getDecodedToken.and.returnValue(null);
    userSubject.next(stubUser);
    fixture.detectChanges();
    expect(component.hasAiAccess).toBeFalse();
  });

  it('should show the AI panel when toggle is called', () => {
    authServiceMock.getDecodedToken.and.returnValue(adminToken);
    userSubject.next(stubUser);
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-panel--open')).not.toBeNull();
  });

  it('should hide the AI panel on second toggle call', () => {
    authServiceMock.getDecodedToken.and.returnValue(adminToken);
    userSubject.next(stubUser);
    component.isOpen = true;
    fixture.detectChanges();

    component.toggle();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.ai-panel--open')).toBeNull();
  });

  it('should set isLoggedIn=true and refresh hasAiAccess on auth:login_success', () => {
    authServiceMock.getDecodedToken.and.returnValue(adminToken);
    loginSuccessSubject.next(null);
    expect(component.isLoggedIn).toBeTrue();
    expect(component.hasAiAccess).toBeTrue();
  });

  it('should clear state on auth:logout', () => {
    component.isLoggedIn = true;
    component.hasAiAccess = true;
    component.isOpen = true;
    logoutSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.hasAiAccess).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should clear state on auth:login_failure', () => {
    component.isLoggedIn = true;
    component.hasAiAccess = true;
    component.isOpen = true;
    loginFailureSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.hasAiAccess).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should clear state on auth:session_expired', () => {
    component.isLoggedIn = true;
    component.hasAiAccess = true;
    component.isOpen = true;
    sessionExpiredSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.hasAiAccess).toBeFalse();
    expect(component.isOpen).toBeFalse();
  });

  it('should close panel and clear access when user$ emits null', () => {
    component.isLoggedIn = true;
    component.hasAiAccess = true;
    component.isOpen = true;
    userSubject.next(null);
    expect(component.isLoggedIn).toBeFalse();
    expect(component.hasAiAccess).toBeFalse();
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
      'https://InkRamp.github.io/InkRamp/mfe-AI-CHATBOT/'
    );
    // Both values should be SafeResourceUrl objects (not raw strings)
    expect(typeof component.aiUrl).not.toBe('string');
    expect(component.aiUrl).toBeTruthy();
  });

  describe('MessageBridge wiring', () => {
    it('should connect the bridge when the iframe loads', () => {
      const iframe = document.createElement('iframe');
      component.onIframeLoad(iframe);
      expect(bridgeMock.connect).toHaveBeenCalledWith(iframe);
    });

    it('should disconnect the bridge on auth:logout', () => {
      component.isLoggedIn = true;
      logoutSubject.next(null);
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on auth:login_failure', () => {
      component.isLoggedIn = true;
      loginFailureSubject.next(null);
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on auth:session_expired', () => {
      component.isLoggedIn = true;
      sessionExpiredSubject.next(null);
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge when user$ emits null', () => {
      userSubject.next(null);
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge on ngOnDestroy', () => {
      component.ngOnDestroy();
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });

    it('should disconnect the bridge when user has no AI-eligible role', () => {
      authServiceMock.getDecodedToken.and.returnValue({ org_and_roles: { 'test-org': ['unknown-role'] } });
      userSubject.next(stubUser);
      expect(bridgeMock.disconnect).toHaveBeenCalled();
    });
  });
});
