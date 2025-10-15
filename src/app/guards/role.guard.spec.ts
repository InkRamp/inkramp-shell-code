import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard, adminGuard, superAdminGuard, allRolesGuard } from './role.guard';
import { RoleService, UserRole } from '@org/core-services';

describe('Role Guards', () => {
  let roleService: RoleService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoleService,
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    });

    roleService = TestBed.inject(RoleService);
    router = TestBed.inject(Router);
  });

  describe('roleGuard', () => {
    it('should return false and redirect when no user is logged in', () => {
      roleService.setCurrentUser(null);
      const guard = roleGuard([UserRole.SUPER_ADMIN]);
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should return true when user has required role', () => {
      roleService.setCurrentUser({
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.SUPER_ADMIN
      });

      const guard = roleGuard([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should return false and redirect when user does not have required role', () => {
      roleService.setCurrentUser({
        id: '1',
        name: 'Sales User',
        email: 'sales@example.com',
        role: UserRole.SALES_EXECUTIVE
      });

      const guard = roleGuard([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]);
      const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('adminGuard', () => {
    it('should allow SUPER_ADMIN', () => {
      roleService.setCurrentUser({
        id: '1',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow ORG_ADMIN', () => {
      roleService.setCurrentUser({
        id: '2',
        name: 'Org Admin',
        email: 'orgadmin@example.com',
        role: UserRole.ORG_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow TEAM_LEAD', () => {
      roleService.setCurrentUser({
        id: '3',
        name: 'Team Lead',
        email: 'teamlead@example.com',
        role: UserRole.TEAM_LEAD
      });

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should not allow SALES_EXECUTIVE', () => {
      roleService.setCurrentUser({
        id: '4',
        name: 'Sales Exec',
        email: 'sales@example.com',
        role: UserRole.SALES_EXECUTIVE
      });

      const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
      expect(result).toBe(false);
    });
  });

  describe('superAdminGuard', () => {
    it('should allow SUPER_ADMIN', () => {
      roleService.setCurrentUser({
        id: '1',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow ORG_ADMIN', () => {
      roleService.setCurrentUser({
        id: '2',
        name: 'Org Admin',
        email: 'orgadmin@example.com',
        role: UserRole.ORG_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should not allow TEAM_LEAD', () => {
      roleService.setCurrentUser({
        id: '3',
        name: 'Team Lead',
        email: 'teamlead@example.com',
        role: UserRole.TEAM_LEAD
      });

      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(false);
    });

    it('should not allow SALES_EXECUTIVE', () => {
      roleService.setCurrentUser({
        id: '4',
        name: 'Sales Exec',
        email: 'sales@example.com',
        role: UserRole.SALES_EXECUTIVE
      });

      const result = TestBed.runInInjectionContext(() => superAdminGuard({} as any, {} as any));
      expect(result).toBe(false);
    });
  });

  describe('allRolesGuard', () => {
    it('should allow SUPER_ADMIN', () => {
      roleService.setCurrentUser({
        id: '1',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow ORG_ADMIN', () => {
      roleService.setCurrentUser({
        id: '2',
        name: 'Org Admin',
        email: 'orgadmin@example.com',
        role: UserRole.ORG_ADMIN
      });

      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow TEAM_LEAD', () => {
      roleService.setCurrentUser({
        id: '3',
        name: 'Team Lead',
        email: 'teamlead@example.com',
        role: UserRole.TEAM_LEAD
      });

      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });

    it('should allow SALES_EXECUTIVE', () => {
      roleService.setCurrentUser({
        id: '4',
        name: 'Sales Exec',
        email: 'sales@example.com',
        role: UserRole.SALES_EXECUTIVE
      });

      const result = TestBed.runInInjectionContext(() => allRolesGuard({} as any, {} as any));
      expect(result).toBe(true);
    });
  });
});
