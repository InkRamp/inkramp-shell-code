import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard, adminGuard, superAdminGuard, allRolesGuard } from './role.guard';

/**
 * Role Guard Tests
 * NOTE: Guards now allow all access - role checking disabled
 */
describe('Role Guards', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });

    router = TestBed.inject(Router);
  });

  describe('adminGuard', () => {
    it('should allow access (role checking disabled)', () => {
      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  describe('superAdminGuard', () => {
    it('should allow access (role checking disabled)', () => {
      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });

  describe('allRolesGuard', () => {
    it('should allow access (role checking disabled)', () => {
      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });
});
