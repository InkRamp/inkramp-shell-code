import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { roleGuard } from './role.guard';

describe('Role Guards', () => {
  let router: Router;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    sessionStorage.clear();
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticatedSync', 'login']);
    authServiceMock.login.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
            parseUrl: jasmine.createSpy('parseUrl').and.returnValue({ toString: () => '/' })
          }
        },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    router = TestBed.inject(Router);
  });

  describe('roleGuard', () => {
    it('should allow access when user has the required role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      sessionStorage.setItem('role', 'admin');
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(result).toBe(true);
    });

    it('should allow access when user has one of the allowed roles', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      sessionStorage.setItem('role', 'supplier');
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['buyer', 'supplier'])({} as any, {} as any)
      );
      expect(result).toBe(true);
    });

    it('should deny access when role does not match', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      sessionStorage.setItem('role', 'buyer');
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(result).not.toBe(true);
    });

    it('should deny access when no role is present in session storage', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(result).not.toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });
});
