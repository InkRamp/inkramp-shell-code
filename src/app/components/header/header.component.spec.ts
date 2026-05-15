import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService, EventBus, UserInfo } from '@opensourcekd/ng-common-libs';
import { HeaderComponent } from './header.component';
import { UserRole, OrgRolesTokenPayload } from '../../../configs/mfe';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;
  let userSubject: Subject<UserInfo | null>;
  let loginSuccessSubject: Subject<unknown>;
  let logoutSubject: Subject<unknown>;
  let loginFailureSubject: Subject<unknown>;
  let sessionExpiredSubject: Subject<unknown>;

  const stubUser: UserInfo = { sub: 'u1', email: 'test@test.com', name: 'Test', role: 'org-admin' };

  const mockToken = (orgAndRoles: Record<string, string[]>) => {
    const token: OrgRolesTokenPayload = { org_and_roles: orgAndRoles };
    authServiceMock.getDecodedToken.and.returnValue(token);
  };

  beforeEach(async () => {
    userSubject = new Subject<UserInfo | null>();
    loginSuccessSubject = new Subject<unknown>();
    logoutSubject = new Subject<unknown>();
    loginFailureSubject = new Subject<unknown>();
    sessionExpiredSubject = new Subject<unknown>();

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'login', 'logout', 'isAuthenticatedSync', 'getDecodedToken', 'getId', 'getUser'
    ]);
    authServiceMock.user$ = userSubject.asObservable() as any;
    authServiceMock.login.and.returnValue(Promise.resolve());
    authServiceMock.logout.and.returnValue(Promise.resolve());
    authServiceMock.getDecodedToken.and.returnValue(null);
    authServiceMock.getId.and.returnValue('mock-auth-id');
    authServiceMock.getUser.and.returnValue(null);

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
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty availableMfes when user is not logged in', () => {
    userSubject.next(null);
    expect(component.availableMfes).toEqual([]);
  });

  it('should show all 4 MFEs for super-admin', () => {
    mockToken({ hdfc: [UserRole.SUPER_ADMIN] });
    userSubject.next(stubUser);
    expect(component.availableMfes.length).toBe(4);
  });

  it('should show users-crud, crud-rules, my-sales, my-report for org-admin', () => {
    mockToken({ hdfc: [UserRole.ORG_ADMIN] });
    userSubject.next(stubUser);
    const ids = component.availableMfes.map(m => m.id);
    expect(ids).toContain('mfe-users-crud');
    expect(ids).toContain('mfe-crud-rules');
    expect(ids).toContain('mfe-my-sales');
    expect(ids).toContain('mfe-my-report');
    expect(component.availableMfes.length).toBe(4);
  });

  it('should show crud-rules, my-sales, my-report but NOT users-crud for org-lead', () => {
    mockToken({ hdfc: [UserRole.ORG_LEAD] });
    userSubject.next(stubUser);
    const ids = component.availableMfes.map(m => m.id);
    expect(ids).not.toContain('mfe-users-crud');
    expect(ids).toContain('mfe-crud-rules');
    expect(ids).toContain('mfe-my-sales');
    expect(ids).toContain('mfe-my-report');
    expect(component.availableMfes.length).toBe(3);
  });

  it('should show only my-sales and my-report for sales-executive', () => {
    mockToken({ hdfc: [UserRole.SALES_EXECUTIVE] });
    userSubject.next(stubUser);
    const ids = component.availableMfes.map(m => m.id);
    expect(ids).not.toContain('mfe-users-crud');
    expect(ids).not.toContain('mfe-crud-rules');
    expect(ids).toContain('mfe-my-sales');
    expect(ids).toContain('mfe-my-report');
    expect(component.availableMfes.length).toBe(2);
  });

  it('should return empty availableMfes when token has no org_and_roles', () => {
    authServiceMock.getDecodedToken.and.returnValue({} as OrgRolesTokenPayload);
    userSubject.next(stubUser);
    expect(component.availableMfes).toEqual([]);
  });

  it('should sort available MFEs by priority descending', () => {
    mockToken({ hdfc: [UserRole.SUPER_ADMIN] });
    userSubject.next(stubUser);
    const priorities = component.availableMfes.map(m => m.priority);
    expect(priorities.every((p, i) => i === 0 || priorities[i - 1] >= p)).toBeTrue();
  });

  it('should subscribe to EventBus auth events on init', () => {
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_success');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:logout');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:login_failure');
    expect(eventBusMock.on).toHaveBeenCalledWith('auth:session_expired');
  });

  it('should clear nav state on auth:logout event', () => {
    component.currentUser = stubUser;
    component.availableMfes = [{ id: 'x' } as any];

    logoutSubject.next(null);

    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should clear nav state on auth:login_failure event', () => {
    component.currentUser = stubUser;
    component.availableMfes = [{ id: 'x' } as any];

    loginFailureSubject.next({ error: 'access_denied' });

    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should clear nav state on auth:session_expired event', () => {
    component.currentUser = stubUser;
    component.availableMfes = [{ id: 'x' } as any];

    sessionExpiredSubject.next(null);

    expect(component.currentUser).toBeNull();
    expect(component.availableMfes).toEqual([]);
  });

  it('should refresh nav on auth:login_success event', () => {
    authServiceMock.getUser.and.returnValue(stubUser);
    mockToken({ hdfc: [UserRole.SUPER_ADMIN] });

    loginSuccessSubject.next({ appState: { returnTo: '/' } });

    expect(component.currentUser).toBe(stubUser);
    expect(component.availableMfes.length).toBe(4);
  });

  it('should unsubscribe all subscriptions on destroy', () => {
    const spy = spyOn((component as any).subscriptions, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });

  it('toggleMenu should flip menuOpen', () => {
    expect(component.menuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('closeMenu should set menuOpen to false', () => {
    component.menuOpen = true;
    component.closeMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('should reset menuOpen on auth:logout', () => {
    component.menuOpen = true;
    logoutSubject.next(null);
    expect(component.menuOpen).toBeFalse();
  });
});
