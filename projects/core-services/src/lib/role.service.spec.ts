import { TestBed } from '@angular/core/testing';
import { RoleService, UserRole, User } from './role.service';

describe('RoleService', () => {
  let service: RoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return current user', () => {
    const user = service.getCurrentUser();
    expect(user).toBeTruthy();
    expect(user?.id).toBe('user-4');
  });

  it('should set current user', () => {
    const newUser: User = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.SUPER_ADMIN
    };

    service.setCurrentUser(newUser);
    const currentUser = service.getCurrentUser();
    expect(currentUser).toEqual(newUser);
  });

  it('should check if user has specific role', () => {
    const user: User = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(user);
    expect(service.hasRole(UserRole.TEAM_LEAD)).toBe(true);
    expect(service.hasRole(UserRole.SUPER_ADMIN)).toBe(false);
  });

  it('should check if user has any of specified roles', () => {
    const user: User = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(user);
    expect(service.hasAnyRole([UserRole.TEAM_LEAD, UserRole.SUPER_ADMIN])).toBe(true);
    expect(service.hasAnyRole([UserRole.SALES_EXECUTIVE, UserRole.ORG_ADMIN])).toBe(false);
  });

  it('should identify admin users correctly', () => {
    const superAdmin: User = {
      id: 'admin-1',
      name: 'Super Admin',
      email: 'super@example.com',
      role: UserRole.SUPER_ADMIN
    };

    service.setCurrentUser(superAdmin);
    expect(service.isAdmin()).toBe(true);

    const salesUser: User = {
      id: 'sales-1',
      name: 'Sales User',
      email: 'sales@example.com',
      role: UserRole.SALES_EXECUTIVE
    };

    service.setCurrentUser(salesUser);
    expect(service.isAdmin()).toBe(false);
  });

  it('should identify team lead or higher correctly', () => {
    const teamLead: User = {
      id: 'lead-1',
      name: 'Team Lead',
      email: 'lead@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(teamLead);
    expect(service.isTeamLeadOrHigher()).toBe(true);

    const salesUser: User = {
      id: 'sales-1',
      name: 'Sales User',
      email: 'sales@example.com',
      role: UserRole.SALES_EXECUTIVE
    };

    service.setCurrentUser(salesUser);
    expect(service.isTeamLeadOrHigher()).toBe(false);
  });

  it('should return all dummy users', () => {
    const users = service.getAllUsers();
    expect(users.length).toBeGreaterThan(0);
    expect(users.every(u => u.id && u.name && u.email && u.role)).toBe(true);
  });

  it('should return viewable users based on role - sales executive', () => {
    const salesUser: User = {
      id: 'sales-1',
      name: 'Sales User',
      email: 'sales@example.com',
      role: UserRole.SALES_EXECUTIVE
    };

    service.setCurrentUser(salesUser);
    const viewableUsers = service.getViewableUsers();
    expect(viewableUsers.length).toBeGreaterThanOrEqual(1);
    // Sales executive should only see themselves
    const foundSelf = viewableUsers.find(u => u.id === salesUser.id);
    expect(foundSelf).toBeTruthy();
  });

  it('should return viewable users based on role - team lead', () => {
    const teamLead: User = {
      id: 'lead-1',
      name: 'Team Lead',
      email: 'lead@example.com',
      role: UserRole.TEAM_LEAD
    };

    service.setCurrentUser(teamLead);
    const viewableUsers = service.getViewableUsers();
    expect(viewableUsers.length).toBeGreaterThan(1);
  });
});
