import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { bearerTokenInterceptor } from './bearer-token.interceptor';

const API_URL = APP_CONFIG.apiUrl;

describe('bearerTokenInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  function setup(token: string | null) {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getTokenSync']);
    authServiceSpy.getTokenSync.and.returnValue(token);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([bearerTokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  afterEach(() => controller.verify());

  it('adds Authorization header when token exists and URL matches API base', () => {
    setup('test-token');

    http.get(`${API_URL}/items`).subscribe();

    const req = controller.expectOne(`${API_URL}/items`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });

  it('does not add Authorization header when token is null', () => {
    setup(null);

    http.get(`${API_URL}/items`).subscribe();

    const req = controller.expectOne(`${API_URL}/items`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('does not add Authorization header for non-API URLs', () => {
    setup('test-token');

    http.get('https://other-domain.example.com/data').subscribe();

    const req = controller.expectOne('https://other-domain.example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('does not add Authorization header for URLs that share the API prefix as a subdomain', () => {
    setup('test-token');

    // e.g. API_URL = "https://api.example.com"; attacker = "https://api.example.com.attacker.com/..."
    const attackerUrl = `${API_URL}.attacker.com/steal`;
    http.get(attackerUrl).subscribe();

    const req = controller.expectOne(attackerUrl);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('adds Authorization header when request matches API base exactly', () => {
    setup('test-token');

    http.get(API_URL).subscribe();

    const req = controller.expectOne(API_URL);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });

  it('adds Authorization header when request matches API base with query params', () => {
    setup('test-token');

    const urlWithQuery = `${API_URL}?health=1`;
    http.get(urlWithQuery).subscribe();

    const req = controller.expectOne(urlWithQuery);
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    req.flush([]);
  });

  it('passes the original request through unchanged when no token', () => {
    setup(null);

    http.get(`${API_URL}/items`, { params: { page: '1' } }).subscribe();

    const req = controller.expectOne((r) => r.url === `${API_URL}/items`);
    expect(req.request.params.get('page')).toBe('1');
    req.flush([]);
  });
});
