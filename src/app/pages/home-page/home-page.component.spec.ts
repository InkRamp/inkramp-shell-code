import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import { RouterLink } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HomePageComponent } from './home-page.component';
import { OrgRolesTokenPayload, UserRole } from '../../../configs/mfe';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let userSubject: Subject<UserInfo | null>;
  let loginSuccessSubject: Subject<unknown>;
  let logoutSubject: Subject<unknown>;
  let loginFailureSubject: Subject<unknown>;
  let sessionExpiredSubject: Subject<unknown>;

  const stubUser: UserInfo = { sub: 'u1', email: 'buyer@test.com', name: 'Buyer', role: 'buyer' };
  const roleToken = (roles: string[]): OrgRolesTokenPayload => ({ org_and_roles: { org: roles } });

  beforeEach(async () => {
    sessionStorage.clear();
    userSubject = new Subject<UserInfo | null>();
    loginSuccessSubject = new Subject<unknown>();
    logoutSubject = new Subject<unknown>();
    loginFailureSubject = new Subject<unknown>();
    sessionExpiredSubject = new Subject<unknown>();

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'login', 'isAuthenticatedSync', 'getId', 'getUser', 'getDecodedToken'
    ]);
    authServiceMock.user$ = userSubject.asObservable() as any;
    authServiceMock.login.and.returnValue(Promise.resolve());
    authServiceMock.getId.and.returnValue('mock-auth-id');
    authServiceMock.getUser.and.returnValue(null);
    authServiceMock.getDecodedToken.and.returnValue(null);

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
    eventBusMock.getId.and.returnValue('mock-event-bus-id');

    await TestBed.configureTestingModule({
      imports: [HomePageComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null currentUser and empty mfes when not logged in', () => {
    userSubject.next(null);
    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should show login prompt when no user is present', () => {
    userSubject.next(null);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.login-prompt')).toBeTruthy();
    expect(el.querySelector('.mfe-grid')).toBeFalsy();
  });

  it('should show mfe-grid and hide login prompt when user is authenticated', () => {
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));
    userSubject.next(stubUser);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.login-prompt')).toBeFalsy();
    expect(el.querySelector('.mfe-grid')).toBeTruthy();
  });

  it('should show only buyer MFE for buyer role', () => {
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));
    userSubject.next(stubUser);
    const routes = component.availableMfes.map(m => m.route);
    expect(routes).toContain('buyer');
    expect(component.availableMfes.length).toBe(1);
  });

  it('should clear state on auth:logout', () => {
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));
    userSubject.next(stubUser);
    expect(component.currentUser).toBe(stubUser);

    logoutSubject.next(null);
    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should clear state on auth:login_failure', () => {
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));
    userSubject.next(stubUser);

    loginFailureSubject.next({ error: 'access_denied' });
    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should clear state on auth:session_expired', () => {
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));
    userSubject.next(stubUser);

    sessionExpiredSubject.next(null);
    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should refresh state on auth:login_success', () => {
    authServiceMock.getUser.and.returnValue(stubUser);
    authServiceMock.getDecodedToken.and.returnValue(roleToken([UserRole.BUYER]));

    loginSuccessSubject.next({});
    expect(component.currentUser).toBe(stubUser);
    expect(component.availableMfes.length).toBe(1);
  });

  it('should subscribe to all required EventBus auth events', () => {
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
});
