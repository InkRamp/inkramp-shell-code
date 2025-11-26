import { TestBed } from '@angular/core/testing';
import { RoleService } from './role.service';
import { User, UserRole } from './models/roles.model';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default org admin user', (done) => {
    service.currentUser$.subscribe(user => {
      expect(user).toBeTruthy();
      expect(user?.role).toBe(UserRole.ORG_ADMIN);
      expect(user?.id).toBe('user-1');
      done();
    });
  });

  it('should set and get current user', () => {
    const testUser: User = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ORG_ADMIN
    };

    service.setCurrentUser(testUser);
    const currentUser = service.getCurrentUser();

    expect(currentUser).toEqual(testUser);
    expect(service.getCurrentUserRole()).toBe(UserRole.ORG_ADMIN);
  });

  it('should check if user has required role', () => {
    const adminUser: User = {
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      role: UserRole.ORG_ADMIN
    };

    service.setCurrentUser(adminUser);

    expect(service.hasRole(UserRole.SALES_EXECUTIVE)).toBe(true);
    expect(service.hasRole(UserRole.TEAM_LEAD)).toBe(true);
    expect(service.hasRole(UserRole.ORG_ADMIN)).toBe(true);
    expect(service.hasRole(UserRole.SUPER_ADMIN)).toBe(false);
  });

  it('should determine if user can view others data', () => {
    const adminUser: User = {
      id: '1',
      name: 'Admin',
      email: 'admin@example.com',
      role: UserRole.ORG_ADMIN
    };

    const salesUser: User = {
      id: '2',
      name: 'Sales',
      email: 'sales@example.com',
      role: UserRole.SALES_EXECUTIVE
    };

    service.setCurrentUser(adminUser);
    expect(service.canViewOthersData()).toBe(true);

    service.setCurrentUser(salesUser);
    expect(service.canViewOthersData()).toBe(false);
  });

  it('should persist user in session storage', () => {
    const testUser: User = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(testUser);
    const stored = sessionStorage.getItem('current_user');

    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(testUser);
  });

  it('should clear user from session storage on null', () => {
    const testUser: User = {
      id: '123',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(testUser);
    service.setCurrentUser(null);

    expect(sessionStorage.getItem('current_user')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should map Zitadel user to internal user with correct role based on email', () => {
    const adminUserInfo = {
      sub: 'zitadel-123',
      name: 'Admin User',
      email: 'admin@example.com'
    };

    service.setUserFromAuth(adminUserInfo);
    const user = service.getCurrentUser();

    expect(user).toBeTruthy();
    expect(user?.id).toBe('zitadel-123');
    expect(user?.name).toBe('Admin User');
    expect(user?.email).toBe('admin@example.com');
    expect(user?.role).toBe(UserRole.SUPER_ADMIN);
  });

  it('should assign SALES_EXECUTIVE role by default', () => {
    const userInfo = {
      sub: 'zitadel-456',
      name: 'Regular User',
      email: 'user@example.com'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user?.role).toBe(UserRole.SALES_EXECUTIVE);
  });

  it('should assign TEAM_LEAD role for team/lead emails', () => {
    const userInfo = {
      sub: 'zitadel-789',
      name: 'Team Lead',
      email: 'team.lead@example.com'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user?.role).toBe(UserRole.TEAM_LEAD);
  });

  it('should assign ORG_ADMIN role for manager/org emails', () => {
    const userInfo = {
      sub: 'zitadel-101',
      name: 'Manager User',
      email: 'manager@example.com'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user?.role).toBe(UserRole.ORG_ADMIN);
  });

  it('should handle missing email gracefully', () => {
    const userInfo = {
      sub: 'zitadel-102',
      name: 'No Email User'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user).toBeTruthy();
    expect(user?.email).toBe('');
    expect(user?.role).toBe(UserRole.SALES_EXECUTIVE);
  });

  it('should handle missing name by using email', () => {
    const userInfo = {
      sub: 'zitadel-103',
      email: 'user@example.com'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user?.name).toBe('user@example.com');
  });

  it('should handle missing name and email', () => {
    const userInfo = {
      sub: 'zitadel-104'
    };

    service.setUserFromAuth(userInfo);
    const user = service.getCurrentUser();

    expect(user?.name).toBe('User');
  });

  describe('hasCapability()', () => {
    it('should return true for exact capability match', () => {
      const user: User = {
        id: '1',
        name: 'Team Lead',
        email: 'lead@example.com',
        role: UserRole.TEAM_LEAD
      };
      service.setCurrentUser(user);

      expect(service.hasCapability('rule.create')).toBe(true);
      expect(service.hasCapability('rule.view')).toBe(true);
      expect(service.hasCapability('team.view')).toBe(true);
    });

    it('should return false for capabilities not assigned to role', () => {
      const user: User = {
        id: '1',
        name: 'Sales Executive',
        email: 'sales@example.com',
        role: UserRole.SALES_EXECUTIVE
      };
      service.setCurrentUser(user);

      expect(service.hasCapability('rule.create')).toBe(false);
      expect(service.hasCapability('user.manage')).toBe(false);
    });

    it('should support wildcard capabilities for super admin', () => {
      const user: User = {
        id: '1',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: UserRole.SUPER_ADMIN
      };
      service.setCurrentUser(user);

      expect(service.hasCapability('rule.create')).toBe(true);
      expect(service.hasCapability('rule.update')).toBe(true);
      expect(service.hasCapability('rule.delete')).toBe(true);
      expect(service.hasCapability('user.manage')).toBe(true);
      expect(service.hasCapability('org.settings')).toBe(true);
    });

    it('should return false when no user is set', () => {
      service.setCurrentUser(null);
      expect(service.hasCapability('rule.view')).toBe(false);
    });

    it('should support org admin capabilities', () => {
      const user: User = {
        id: '1',
        name: 'Org Admin',
        email: 'orgadmin@example.com',
        role: UserRole.ORG_ADMIN
      };
      service.setCurrentUser(user);

      expect(service.hasCapability('user.create')).toBe(true);
      expect(service.hasCapability('user.manage')).toBe(true);
      expect(service.hasCapability('rule.create')).toBe(true);
      expect(service.hasCapability('rule.update')).toBe(true);
    });
  });

  describe('dev mimic user with sessionStorage', () => {
    beforeEach(() => {
      sessionStorage.clear();
    });

    it('should store dev mimic user in sessionStorage', () => {
      const mimicUser: User = {
        id: 'mimic-1',
        name: 'Mimic User',
        email: 'mimic@example.com',
        role: UserRole.SUPER_ADMIN
      };

      service.setDevMimicUser(mimicUser);

      const stored = sessionStorage.getItem('dev_mimic_user');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mimicUser);
    });

    it('should clear dev mimic user from sessionStorage', () => {
      const mimicUser: User = {
        id: 'mimic-1',
        name: 'Mimic User',
        email: 'mimic@example.com',
        role: UserRole.SUPER_ADMIN
      };

      service.setDevMimicUser(mimicUser);
      service.setDevMimicUser(null);

      expect(sessionStorage.getItem('dev_mimic_user')).toBeNull();
    });
  });
});
