import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HomePageComponent } from './home-page.component';
import { MfeLoaderService, AuthService } from '@org/core-services';

describe('HomePageComponent - Invitation Handling', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockMfeLoaderService: jasmine.SpyObj<MfeLoaderService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create spy objects
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'login']);
    mockMfeLoaderService = jasmine.createSpyObj('MfeLoaderService', ['getConfigs']);

    // Setup mock activated route
    mockActivatedRoute = {
      queryParams: of({})
    };

    // Configure testing module
    await TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MfeLoaderService, useValue: mockMfeLoaderService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    
    // Setup default mock return values
    mockMfeLoaderService.getConfigs.and.returnValue([]);
    mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

    it('should not trigger login when both invitation and organization parameters present but user already authenticated', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(true));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
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

    it('should handle multiple query parameter changes', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      
      // First call without invitation
      mockActivatedRoute.queryParams = of({});
      fixture.detectChanges();
      await fixture.whenStable();
      expect(mockAuthService.login).not.toHaveBeenCalled();

      // Second call with invitation
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
      
      // Manually trigger the subscription
      component.ngOnInit();
      await fixture.whenStable();

      expect(mockAuthService.login).toHaveBeenCalledWith(undefined, {
        invitation: 'test-invitation-token',
        organization: 'org_123456'
      });
    });

    it('should load MFE configs on initialization', () => {
      const mockConfigs = [
        { name: 'mfe1', url: 'http://localhost:4101' },
        { name: 'mfe2', url: 'http://localhost:4102' }
      ];
      mockMfeLoaderService.getConfigs.and.returnValue(mockConfigs as any);

      fixture.detectChanges();

      expect(mockMfeLoaderService.getConfigs).toHaveBeenCalled();
      expect(component.allMfes).toEqual(mockConfigs as any);
    });
  });

  describe('Edge Cases', () => {
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

    it('should handle null invitation parameter', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: null,
        organization: 'org_123456'
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle null organization parameter', async () => {
      mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
      mockActivatedRoute.queryParams = of({
        invitation: 'test-invitation-token',
        organization: null
      });
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });
});
