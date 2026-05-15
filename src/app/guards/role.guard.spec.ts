import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, TokenPayload } from '@InkRamp/ng-common-libs';
import { roleGuard, adminGuard, superAdminGuard, allRolesGuard } from './role.guard';

interface OrgRolesTokenPayload extends TokenPayload {
  org_and_roles?: Record<string, string[]>;
}

describe('Role Guards', () => {
  let router: Router;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  const mockToken = (orgAndRoles: Record<string, string[]>) => {
    const token: OrgRolesTokenPayload = { org_and_roles: orgAndRoles };
    authServiceMock.getDecodedToken.and.returnValue(token);
  };

  beforeEach(() => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['isAuthenticatedSync', 'login', 'getDecodedToken']);
    authServiceMock.login.and.returnValue(Promise.resolve());
    authServiceMock.getDecodedToken.and.returnValue(null);

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
    it('should allow access when user is authenticated with org-admin role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['org-admin'] });
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow access when user has super-admin role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['super-admin', 'org-admin'] });
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should deny access when user has only sales-executive role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['sales-executive'] });
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).not.toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });

  describe('superAdminGuard', () => {
    it('should allow access when user has super-admin role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['super-admin'] });
      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should deny access when user has only org-admin role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['org-admin'] });
      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).not.toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });

  describe('allRolesGuard', () => {
    it('should allow access when user has sales-executive role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['sales-executive'] });
      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow access when user has org-lead role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['org-lead'] });
      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should deny access when user has no roles in org_and_roles', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({});
      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).not.toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });

  describe('roleGuard', () => {
    it('should allow access when user has one of the allowed roles across any org', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ org1: ['org-lead'], org2: ['org-admin'] });
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['super-admin', 'org-admin', 'org-lead'])({} as any, {} as any)
      );
      expect(result).toBe(true);
    });

    it('should deny access when user has no matching roles', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['sales-executive'] });
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['super-admin', 'org-admin'])({} as any, {} as any)
      );
      expect(result).not.toBe(true);
    });

    it('should deny access when token has no org_and_roles claim', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const emptyToken: OrgRolesTokenPayload = {};
      authServiceMock.getDecodedToken.and.returnValue(emptyToken);
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['super-admin'])({} as any, {} as any)
      );
      expect(result).not.toBe(true);
    });

    it('should redirect and initiate login when user is not authenticated', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(false);
      TestBed.runInInjectionContext(() =>
        roleGuard(['super-admin'])({} as any, {} as any)
      );
      expect(authServiceMock.login).toHaveBeenCalled();
    });
  });
});
