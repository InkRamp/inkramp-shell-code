import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { EventBusService } from './event-bus.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth0Client: any;
  let eventBusService: EventBusService;

  beforeEach(async () => {
    // Clear storage
    sessionStorage.clear();

    // Create mock Auth0 client
    mockAuth0Client = {
      loginWithRedirect: jasmine.createSpy('loginWithRedirect').and.returnValue(Promise.resolve()),
      handleRedirectCallback: jasmine.createSpy('handleRedirectCallback').and.returnValue(Promise.resolve({
        appState: undefined
      })),
      getUser: jasmine.createSpy('getUser').and.returnValue(Promise.resolve({
        sub: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        email_verified: true
      })),
      getTokenSilently: jasmine.createSpy('getTokenSilently').and.returnValue(Promise.resolve('mock-access-token')),
      isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(Promise.resolve(false)),
      logout: jasmine.createSpy('logout').and.returnValue(Promise.resolve())
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, EventBusService]
    });

    service = TestBed.inject(AuthService);
    eventBusService = TestBed.inject(EventBusService);

    // Override the auth0Client initialization
    // This is a workaround since we can't easily mock the createAuth0Client import
    // We'll access the private property for testing purposes
    (service as any).auth0Client = mockAuth0Client;
    (service as any).initializationPromise = Promise.resolve();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login with invitation parameters', () => {
    it('should call loginWithRedirect without invitation parameters when not provided', async () => {
      await service.login();

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith(
        jasmine.objectContaining({
          authorizationParams: jasmine.objectContaining({
            redirect_uri: jasmine.any(String),
            scope: jasmine.any(String)
          })
        })
      );

      // Verify invitation and organization parameters are not included
      const callArgs = mockAuth0Client.loginWithRedirect.calls.argsFor(0)[0];
      expect(callArgs.authorizationParams.invitation).toBeUndefined();
      expect(callArgs.authorizationParams.organization).toBeUndefined();
    });

    it('should include invitation parameter when provided', async () => {
      const invitationToken = 'test-invitation-token';
      
      await service.login(undefined, { invitation: invitationToken });

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith(
        jasmine.objectContaining({
          authorizationParams: jasmine.objectContaining({
            invitation: invitationToken,
            redirect_uri: jasmine.any(String),
            scope: jasmine.any(String)
          })
        })
      );
    });

    it('should include organization parameter when provided', async () => {
      const organizationId = 'org_123456';
      
      await service.login(undefined, { organization: organizationId });

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith(
        jasmine.objectContaining({
          authorizationParams: jasmine.objectContaining({
            organization: organizationId,
            redirect_uri: jasmine.any(String),
            scope: jasmine.any(String)
          })
        })
      );
    });

    it('should include both invitation and organization parameters when provided', async () => {
      const invitationToken = 'test-invitation-token';
      const organizationId = 'org_123456';
      
      await service.login(undefined, { 
        invitation: invitationToken,
        organization: organizationId
      });

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith(
        jasmine.objectContaining({
          authorizationParams: jasmine.objectContaining({
            invitation: invitationToken,
            organization: organizationId,
            redirect_uri: jasmine.any(String),
            scope: jasmine.any(String)
          })
        })
      );
    });

    it('should preserve URL parameters through auth flow when provided', async () => {
      // Mock window.location
      spyOnProperty(window, 'location', 'get').and.returnValue({
        pathname: '/home',
        search: '?invitation=abc&organization=org_123'
      } as any);

      await service.login();

      expect(mockAuth0Client.loginWithRedirect).toHaveBeenCalledWith(
        jasmine.objectContaining({
          appState: jasmine.objectContaining({
            returnTo: '?invitation=abc&organization=org_123'
          })
        })
      );
    });

    it('should not preserve URL parameters when on callback page', async () => {
      // Mock window.location
      spyOnProperty(window, 'location', 'get').and.returnValue({
        pathname: '/auth-callback',
        search: '?code=123'
      } as any);

      await service.login();

      // appState should be undefined since we're on callback page
      const callArgs = mockAuth0Client.loginWithRedirect.calls.argsFor(0)[0];
      expect(callArgs.appState).toBeUndefined();
    });
  });

  describe('handleCallback', () => {
    it('should process callback and retrieve user info', async () => {
      const result = await service.handleCallback();

      expect(result.success).toBe(true);
      expect(mockAuth0Client.handleRedirectCallback).toHaveBeenCalled();
      expect(mockAuth0Client.getUser).toHaveBeenCalled();
      expect(mockAuth0Client.getTokenSilently).toHaveBeenCalled();
    });

    it('should return appState from callback result', async () => {
      const mockAppState = { returnTo: '?invitation=abc' };
      mockAuth0Client.handleRedirectCallback.and.returnValue(Promise.resolve({
        appState: mockAppState
      }));

      const result = await service.handleCallback();

      expect(result.success).toBe(true);
      expect(result.appState).toEqual(mockAppState);
    });

    it('should return failure when user info is not available', async () => {
      mockAuth0Client.getUser.and.returnValue(Promise.resolve(null));

      const result = await service.handleCallback();

      expect(result.success).toBe(false);
    });

    it('should handle callback errors gracefully', async () => {
      mockAuth0Client.handleRedirectCallback.and.returnValue(Promise.reject(new Error('Callback error')));

      const result = await service.handleCallback();

      expect(result.success).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return authentication status from Auth0 client', async () => {
      mockAuth0Client.isAuthenticated.and.returnValue(Promise.resolve(true));

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
      expect(mockAuth0Client.isAuthenticated).toHaveBeenCalled();
    });

    it('should fallback to storage check on error', async () => {
      mockAuth0Client.isAuthenticated.and.returnValue(Promise.reject(new Error('Auth check error')));
      sessionStorage.setItem('auth0_access_token', 'test-token');

      const result = await service.isAuthenticated();

      expect(result).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return current user from subject', () => {
      const user = service.getUser();
      
      // Initially should be null since we haven't authenticated
      expect(user).toBeNull();
    });
  });

  describe('getUserData', () => {
    it('should return null when user is not authenticated', () => {
      const userData = service.getUserData();
      expect(userData).toBeNull();
    });

    it('should extract user data from token claims', async () => {
      // Simulate authentication
      mockAuth0Client.getUser.and.returnValue(Promise.resolve({
        sub: 'auth0|123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        org: 'org_123'
      }));

      await service.handleCallback();
      const userData = service.getUserData();

      expect(userData).toEqual({
        id: 'auth0|123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        org: 'org_123'
      });
    });

    it('should handle missing role and org gracefully', async () => {
      // Simulate authentication without role/org
      mockAuth0Client.getUser.and.returnValue(Promise.resolve({
        sub: 'auth0|123',
        name: 'Test User',
        email: 'test@example.com'
      }));

      await service.handleCallback();
      const userData = service.getUserData();

      expect(userData).toEqual({
        id: 'auth0|123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        org: 'default'
      });
    });
  });
});
