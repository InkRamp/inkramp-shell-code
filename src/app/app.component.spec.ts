import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from '@opensourcekd/ng-common-libs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    // Create spy objects
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'login', 'getUser', 'isAuthenticatedSync']);

    // Setup mock activated route
    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    // Setup default mock return values
    mockAuthService.isAuthenticated.and.returnValue(Promise.resolve(false));
    mockAuthService.isAuthenticatedSync.and.returnValue(false);
    mockAuthService.getUser.and.returnValue(null);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'Incentive Management System' title`, () => {
    expect(component.title).toEqual('Incentive Management System');
  });

  it('should initialize without errors', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component).toBeTruthy();
  });
});

