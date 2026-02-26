import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService, UserInfo, TokenPayload } from '@opensourcekd/ng-common-libs';
import { HeaderComponent } from './header.component';
import { UserRole } from '../../../configs/mfe';

interface OrgRolesTokenPayload extends TokenPayload {
  org_and_roles?: Record<string, string[]>;
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userSubject: Subject<UserInfo | null>;

  const stubUser: UserInfo = { sub: 'u1', email: 'test@test.com', name: 'Test', role: 'org-admin' };

  const mockToken = (orgAndRoles: Record<string, string[]>) => {
    const token: OrgRolesTokenPayload = { org_and_roles: orgAndRoles };
    authServiceMock.getDecodedToken.and.returnValue(token);
  };

  beforeEach(async () => {
    userSubject = new Subject<UserInfo | null>();
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'login', 'logout', 'isAuthenticatedSync', 'getDecodedToken', 'getId'
    ]);
    authServiceMock.user$ = userSubject.asObservable() as any;
    authServiceMock.login.and.returnValue(Promise.resolve());
    authServiceMock.logout.and.returnValue(Promise.resolve());
    authServiceMock.getDecodedToken.and.returnValue(null);
    authServiceMock.getId.and.returnValue('mock-auth-id');

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
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
});
