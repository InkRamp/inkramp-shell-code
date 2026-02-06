import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from '@opensourcekd/ng-common-libs';
import { RoleService, MfeLoaderService } from '@org/core-services';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRoleService: jasmine.SpyObj<RoleService>;
  let mockMfeLoaderService: jasmine.SpyObj<MfeLoaderService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create spy objects
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'login', 'getUser']);
    mockRoleService = jasmine.createSpyObj('RoleService', ['getCurrentUser', 'setUserFromAuth']);
    mockMfeLoaderService = jasmine.createSpyObj('MfeLoaderService', ['setConfigs']);

    // Setup mock activated route
    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: MfeLoaderService, useValue: mockMfeLoaderService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Setup default mock return values
    mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
    mockAuthService.getUser.and.returnValue(null);
    mockRoleService.getCurrentUser.and.returnValue(null);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'Incentive Management System' title`, () => {
    expect(component.title).toEqual('Incentive Management System');
  });

  describe('Organization Invitation Handling', () => {
    it('should not trigger login when no invitation parameters present', async () => {
      mockActivatedRoute.queryParams = of({});
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not trigger login when only invitation parameter present', async () => {
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not trigger login when only organization parameter present', async () => {
      mockActivatedRoute.queryParams = of({
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should trigger login when both invitation and organization parameters present and user not authenticated', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: 'org_123456',
        organization_name: 'Test Org'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).toHaveBeenCalledWith(undefined, {
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
    });

    it('should trigger login when both invitation and organization parameters present even if user already authenticated', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(true));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).toHaveBeenCalledWith(undefined, {
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
    });

    it('should handle invitation parameters without organization_name', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).toHaveBeenCalledWith(undefined, {
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
    });

    it('should handle empty string invitation parameter', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: '',
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle empty string organization parameter', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: ''
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('User Sync', () => {
    it('should sync authenticated user to role service when authenticated', async () => {
      const mockUserInfo = {
        sub: 'user-123',
        name: 'Test User',
        email: 'test@example.com'
      };

      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(true));
      mockAuthService.getUser.and.returnValue(mockUserInfo);
      mockRoleService.getCurrentUser.and.returnValue(null);

      await component.ngOnInit();

      expect(mockRoleService.setUserFromAuth).toHaveBeenCalledWith(mockUserInfo);
    });

    it('should not sync user when not authenticated', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockAuthService.getUser.and.returnValue(null);

      await component.ngOnInit();

      expect(mockRoleService.setUserFromAuth).not.toHaveBeenCalled();
    });

    it('should not sync user when user info is not available', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(true));
      mockAuthService.getUser.and.returnValue(null);

      await component.ngOnInit();

      expect(mockRoleService.setUserFromAuth).not.toHaveBeenCalled();
    });
  });
});

