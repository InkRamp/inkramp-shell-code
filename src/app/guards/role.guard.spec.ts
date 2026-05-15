import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { roleGuard } from './role.guard';
import { OrgRolesTokenPayload } from '../../configs/mfe';

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

  describe('roleGuard', () => {
    it('should allow access when user has the required role', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ org1: ['admin'] });
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(result).toBe(true);
    });

    it('should allow access when user has one of the allowed roles across any org', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ org1: ['buyer'], org2: ['supplier'] });
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['buyer', 'supplier'])({} as any, {} as any)
      );
      expect(result).toBe(true);
    });

    it('should deny access when user has no matching roles', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      mockToken({ hdfc: ['buyer'] });
      const result = TestBed.runInInjectionContext(() =>
        roleGuard(['admin'])({} as any, {} as any)
      );
      expect(result).not.toBe(true);
    });

    it('should deny access when token has no org_and_roles claim', () => {
      authServiceMock.isAuthenticatedSync.and.returnValue(true);
      const emptyToken: OrgRolesTokenPayload = {};
      authServiceMock.getDecodedToken.and.returnValue(emptyToken);
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
