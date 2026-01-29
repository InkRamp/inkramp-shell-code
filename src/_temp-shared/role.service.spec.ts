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

  describe('org_and_roles token structure', () => {
    it('should extract role from org_and_roles with single organization', () => {
      const userInfo = {
        sub: 'auth0-123',
        name: 'Test User',
        email: 'test@example.com',
        org_and_roles: {
          hdfc: ['super-admin', 'org-admin']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('should extract highest privilege role from org_and_roles with multiple organizations', () => {
      const userInfo = {
        sub: 'auth0-124',
        name: 'Multi Org User',
        email: 'multi@example.com',
        org_and_roles: {
          hdfc: ['org-admin'],
          icici: ['super-admin'],
          axis: ['sales-executive']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('should handle org_and_roles with single role per organization', () => {
      const userInfo = {
        sub: 'auth0-125',
        name: 'Single Role User',
        email: 'single@example.com',
        org_and_roles: {
          hdfc: ['team-lead']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.TEAM_LEAD);
    });

    it('should prioritize super-admin over org-admin', () => {
      const userInfo = {
        sub: 'auth0-126',
        name: 'Priority Test',
        email: 'priority@example.com',
        org_and_roles: {
          org1: ['sales-executive', 'org-admin'],
          org2: ['team-lead', 'super-admin']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.SUPER_ADMIN);
    });

    it('should prioritize org-admin over team-lead', () => {
      const userInfo = {
        sub: 'auth0-127',
        name: 'Admin Priority',
        email: 'adminpri@example.com',
        org_and_roles: {
          org1: ['sales-executive', 'team-lead'],
          org2: ['org-admin']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.ORG_ADMIN);
    });

    it('should prioritize team-lead over sales-executive', () => {
      const userInfo = {
        sub: 'auth0-128',
        name: 'Lead Priority',
        email: 'leadpri@example.com',
        org_and_roles: {
          org1: ['sales-executive'],
          org2: ['team-lead']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      expect(user?.role).toBe(UserRole.TEAM_LEAD);
    });

    it('should handle empty org_and_roles', () => {
      const userInfo = {
        sub: 'auth0-129',
        name: 'Empty Roles',
        email: 'empty@example.com',
        org_and_roles: {}
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      // Should fall back to email pattern matching
      expect(user?.role).toBe(UserRole.SALES_EXECUTIVE);
    });

    it('should handle org_and_roles with empty array', () => {
      const userInfo = {
        sub: 'auth0-130',
        name: 'Empty Array',
        email: 'emptyarray@example.com',
        org_and_roles: {
          org1: []
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      // Should fall back to email pattern matching
      expect(user?.role).toBe(UserRole.SALES_EXECUTIVE);
    });

    it('should prefer top-level role over org_and_roles', () => {
      const userInfo = {
        sub: 'auth0-131',
        name: 'Top Level Priority',
        email: 'toplevel@example.com',
        role: 'team-lead',
        org_and_roles: {
          hdfc: ['super-admin']
        }
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      // Top-level role claim takes precedence
      expect(user?.role).toBe(UserRole.TEAM_LEAD);
    });

    it('should handle org_and_roles as non-object gracefully', () => {
      const userInfo = {
        sub: 'auth0-132',
        name: 'Invalid Format',
        email: 'invalid@example.com',
        org_and_roles: 'invalid'
      };

      service.setUserFromAuth(userInfo);
      const user = service.getCurrentUser();

      // Should fall back to email pattern matching
      expect(user?.role).toBe(UserRole.SALES_EXECUTIVE);
    });
  });
});
