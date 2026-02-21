import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { roleGuard, adminGuard, superAdminGuard, allRolesGuard } from './role.guard';

describe('Role Guards', () => {
  let router: Router;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
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

  describe('adminGuard', () => {
    it('should allow access when user is authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });

  describe('superAdminGuard', () => {
    it('should allow access when user is authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });

  describe('allRolesGuard', () => {
    it('should allow access when user is authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });
});
