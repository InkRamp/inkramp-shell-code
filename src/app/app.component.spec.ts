import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from './app.component';
import { EventBus, AuthService } from '@opensourcekd/ng-common-libs';

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

    authServiceMock = jasmine.createSpyObj('AuthService', ['getId', 'handleCallback']);
    authServiceMock.getId.and.returnValue('shell');
    authServiceMock.handleCallback.and.returnValue(Promise.resolve({ success: true }));

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
        { provide: Router, useValue: routerMock }
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

  it('should navigate to returnTo URL on auth:login_success', async () => {
    await component.ngOnInit();
    loginSuccessSubject.next({ appState: { returnTo: '/rules' } });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/rules'], { replaceUrl: true });
  });

  it('should navigate to / when returnTo is absent on auth:login_success', async () => {
    await component.ngOnInit();
    loginSuccessSubject.next({});

    expect(routerMock.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it('should navigate to / on auth:logout', async () => {
    await component.ngOnInit();
    logoutSubject.next(null);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it('should navigate to / on auth:login_failure', async () => {
    await component.ngOnInit();
    loginFailureSubject.next({ error: 'access_denied' });

    expect(routerMock.navigate).toHaveBeenCalledWith(['/'], { replaceUrl: true });
  });

  it('should unsubscribe all subscriptions on destroy', async () => {
    await component.ngOnInit();
    const spy = spyOn((component as any).subscriptions, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
