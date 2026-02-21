import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { EventBus, AuthService } from '@opensourcekd/ng-common-libs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockActivatedRoute: any;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let eventBusMock: jasmine.SpyObj<EventBus>;

  beforeEach(async () => {
    mockActivatedRoute = {
      snapshot: { queryParams: {} }
    };

    authServiceMock = jasmine.createSpyObj('AuthService', ['getId', 'handleCallback']);
    authServiceMock.getId.and.returnValue('shell');
    authServiceMock.handleCallback.and.returnValue(Promise.resolve({ success: true }));

    eventBusMock = jasmine.createSpyObj('EventBus', ['getId']);
    eventBusMock.getId.and.returnValue('shell');

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventBus, useValue: eventBusMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have the title', () => {
    expect(component.title).toEqual('Incentive Management System');
  });
});
