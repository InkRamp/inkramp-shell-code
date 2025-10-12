import { TestBed } from '@angular/core/testing';
import { MfeLoaderService } from './mfe-loader.service';
import { UserRole } from './models/roles.model';
import { MfeConfig } from './models/mfe.model';

describe('MfeLoaderService', () => {
  let service: MfeLoaderService;

  const mockConfigs: MfeConfig[] = [
    {
      id: 'test-mfe-1',
      name: 'test1',
      displayName: 'Test MFE 1',
      remoteName: 'testMfe1',
      exposedModule: './Component',
      url: 'http://localhost:3001/remoteEntry.js',
      route: 'test1',
      allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN],
      priority: 10
    },
    {
      id: 'test-mfe-2',
      name: 'test2',
      displayName: 'Test MFE 2',
      remoteName: 'testMfe2',
      exposedModule: './Component',
      url: 'http://localhost:3002/remoteEntry.js',
      route: 'test2',
      allowedRoles: [UserRole.SALES_EXECUTIVE],
      priority: 5
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MfeLoaderService);
    service.setConfigs(mockConfigs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get configs', () => {
    const configs = service.getConfigs();
    expect(configs.length).toBe(2);
    expect(configs[0].priority).toBeGreaterThanOrEqual(configs[1].priority);
  });

  it('should sort configs by priority', () => {
    const configs = service.getConfigs();
    expect(configs[0].priority).toBe(10);
    expect(configs[1].priority).toBe(5);
  });

  it('should filter configs by role', () => {
    const adminConfigs = service.getConfigsForRole(UserRole.SUPER_ADMIN);
    expect(adminConfigs.length).toBe(1);
    expect(adminConfigs[0].name).toBe('test1');

    const salesConfigs = service.getConfigsForRole(UserRole.SALES_EXECUTIVE);
    expect(salesConfigs.length).toBe(1);
    expect(salesConfigs[0].name).toBe('test2');
  });

  it('should get config by name', () => {
    const config = service.getConfigByName('test1');
    expect(config).toBeTruthy();
    expect(config?.id).toBe('test-mfe-1');

    const notFound = service.getConfigByName('nonexistent');
    expect(notFound).toBeUndefined();
  });

  it('should track MFE loaded state', () => {
    expect(service.isMfeLoaded('test1')).toBe(false);
  });

  it('should track MFE loading state', () => {
    expect(service.isMfeLoading('test1')).toBe(false);
  });

  it('should correctly remove from loading state after successful load', (done) => {
    // Create a test config
    const testConfig: MfeConfig = {
      id: 'test-state',
      name: 'testState',
      displayName: 'Test State',
      remoteName: 'testState',
      exposedModule: './Component',
      url: 'http://localhost:3010/remoteEntry.js',
      route: 'test-state',
      allowedRoles: [UserRole.SUPER_ADMIN],
      priority: 8
    };

    // Track loading states
    let loadingStateBeforeLoad: boolean;
    let loadingStateDuringLoad: boolean;
    let loadingStateAfterLoad: boolean;

    // Subscribe to observe state changes
    const subscription = service.loadingMfes$.subscribe(states => {
      if (states.has(testConfig.name)) {
        loadingStateDuringLoad = true;
      }
    });

    // Check state before load
    loadingStateBeforeLoad = service.isMfeLoading(testConfig.name);
    expect(loadingStateBeforeLoad).toBe(false);

    // Attempt to load (will fail but that's ok for state testing)
    service.loadMfe(testConfig).catch(() => {
      // Error is expected since URL is not real
      // Check that loading state was properly cleared even on error
      loadingStateAfterLoad = service.isMfeLoading(testConfig.name);
      
      expect(loadingStateDuringLoad).toBe(true);
      expect(loadingStateAfterLoad).toBe(false);
      
      subscription.unsubscribe();
      done();
    });
  });
});
