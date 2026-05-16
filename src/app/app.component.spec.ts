import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { EventBus, AuthService } from '@opensourcekd/ng-common-libs';
import { MessageBridgeService } from './services/message-bridge.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockActivatedRoute: any;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let routerMock: jasmine.SpyObj<Router>;
  let loginSuccessSubject: Subject<{ appState?: { returnTo?: string } }>;
  let logoutSubject: Subject<unknown>;
  let loginFailureSubject: Subject<{ error: string }>;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: { queryParams: {} }
    };

    sessionStorage.clear();
    authServiceMock = jasmine.createSpyObj('AuthService', ['getId', 'handleCallback', 'getDecodedToken']);
    authServiceMock.getId.and.returnValue('shell');
    authServiceMock.handleCallback.and.returnValue(Promise.resolve({ success: true }));
    authServiceMock.getDecodedToken.and.returnValue(null);

    loginSuccessSubject = new Subject();
    logoutSubject = new Subject();
    loginFailureSubject = new Subject();

    eventBusMock = jasmine.createSpyObj('EventBus', ['getId', 'on', 'emit']);
    eventBusMock.getId.and.returnValue('shell');
    eventBusMock.on.and.callFake((event: string) => {
      switch (event) {
        case 'auth:login_success': return loginSuccessSubject.asObservable() as any;
        case 'auth:logout': return logoutSubject.asObservable() as any;
        case 'auth:login_failure': return loginFailureSubject.asObservable() as any;
        default: return new Subject().asObservable() as any;
      }
    });

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    routerMock.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock },
        { provide: Router, useValue: routerMock },
        {
          provide: MessageBridgeService,
          useValue: jasmine.createSpyObj('MessageBridgeService', ['connect', 'disconnect', 'sendToAi'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the title', () => {
    expect(component.title).toEqual('Incentive Management System');
  });

  it('should subscribe to EventBus auth events on init', async () => {
    await component.ngOnInit();
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_success');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:logout');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_failure');
  });

  it('should use NgZone.run() for auth event handlers', async () => {
    // Spy on the real NgZone instance (don't replace it — Angular internals depend on it)
    const ngZone = TestBed.inject(NgZone);
    const runSpy = spyOn(ngZone, 'run').and.callThrough();

    await component.ngOnInit();
    loginSuccessSubject.next({ appState: { returnTo: '/rules' } });

    expect(runSpy).toHaveBeenCalled();
  });

  it('should navigate to returnTo URL on auth:login_success when returnTo is provided', async () => {
    await component.ngOnInit();
    loginSuccessSubject.next({ appState: { returnTo: '/rules' } });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/rules'], { replaceUrl: true });
  });

  it('should NOT redirect when returnTo is absent and user has no accessible routes', async () => {
    await component.ngOnInit();
    loginSuccessSubject.next({});

    // No token means getFirstAvailableRoute() returns null — no navigation occurs
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to first available route when returnTo is absent on auth:login_success', async () => {
    sessionStorage.setItem('role', 'buyer');
    await component.ngOnInit();
    loginSuccessSubject.next({});

    expect(routerMock.navigate).toHaveBeenCalledWith(['/buyer'], { replaceUrl: true });
  });

  it('should navigate to first available token role route when returnTo is absent', async () => {
    authServiceMock.getDecodedToken.and.returnValue({ org_and_roles: { org: ['admin', 'supplier'] } });
    await component.ngOnInit();
    loginSuccessSubject.next({});

    expect(routerMock.navigate).toHaveBeenCalledWith(['/supplier'], { replaceUrl: true });
  });

  it('should navigate to / inside ngZone on auth:logout', async () => {
    await component.ngOnInit();
    logoutSubject.next(null);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it('should NOT redirect on auth:login_failure (preserves non-auth query params)', async () => {
    await component.ngOnInit();
    loginFailureSubject.next({ error: 'access_denied' });

    // ngZone.run() fires (triggering CD) but no navigation — URL is preserved
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should NOT redirect in catch block when handleCallback throws', async () => {
    authServiceMock.handleCallback.and.returnValue(Promise.reject(new Error('network error')));

    // Use history.pushState to put ?code= into the URL so the if-block is entered
    // and the catch block is actually exercised. Restore the URL afterwards.
    const originalHref = window.location.href;
    history.pushState(null, '', '/?code=abc&state=xyz&other=preserved');

    await component.ngOnInit();

    history.pushState(null, '', originalHref);

    // The library emits auth:login_failure via EventBus for its own errors.
    // The AppComponent catch block must only log — never redirect — so that
    // non-auth query params (like 'other' above) are not discarded.
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should unsubscribe all subscriptions on destroy', async () => {
    await component.ngOnInit();
    const spy = spyOn((component as any).subscriptions, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
