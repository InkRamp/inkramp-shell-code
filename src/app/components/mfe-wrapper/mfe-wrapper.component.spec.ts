import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MfeWrapperComponent } from './mfe-wrapper.component';
import { ActivatedRoute } from '@angular/router';
import { MfeLoaderService } from '@org/core-services';
import { of } from 'rxjs';

describe('MfeWrapperComponent', () => {
  let component: MfeWrapperComponent;
  let fixture: ComponentFixture<MfeWrapperComponent>;
  let mfeLoaderService: jasmine.SpyObj<MfeLoaderService>;

  beforeEach(async () => {
    const mfeLoaderServiceSpy = jasmine.createSpyObj('MfeLoaderService', [
      'setConfigs',
      'getConfigByName',
      'loadMfe'
    ]);

    await TestBed.configureTestingModule({
      imports: [MfeWrapperComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {}
            }
          }
        },
        {
          provide: MfeLoaderService,
          useValue: mfeLoaderServiceSpy
        }
      ]
    })
    .compileComponents();

    mfeLoaderService = TestBed.inject(MfeLoaderService) as jasmine.SpyObj<MfeLoaderService>;
    fixture = TestBed.createComponent(MfeWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.name).toBe('');
    expect(component.names).toEqual([]);
    expect(component.lazyLoad).toBe(true);
  });

  it('should initialize mfeStates when names input is provided', () => {
    component.names = ['pokemon', 'my-sales'];
    component.ngAfterViewInit();
    
    expect(component.mfeStates.length).toBe(2);
    expect(component.mfeStates[0].name).toBe('pokemon');
    expect(component.mfeStates[1].name).toBe('my-sales');
    expect(component.mfeStates[0].loaded).toBe(false);
    expect(component.mfeStates[0].loading).toBe(false);
  });

  it('should support single MFE mode (backward compatible)', () => {
    component.name = 'pokemon';
    
    expect(component.name).toBe('pokemon');
  });

  it('should prefer names array over single name', () => {
    component.name = 'pokemon';
    component.names = ['my-sales', 'my-report'];
    component.ngAfterViewInit();
    
    expect(component.mfeStates.length).toBe(2);
    expect(component.mfeStates[0].name).toBe('my-sales');
  });

  it('should handle empty configuration gracefully', async () => {
    component.names = [];
    component.name = '';
    
    await component.ngAfterViewInit();
    
    // Should not throw error
    expect(component.mfeStates.length).toBe(0);
  });

  it('should cleanup intersection observer on destroy', () => {
    const mockObserver = jasmine.createSpyObj('IntersectionObserver', ['disconnect', 'observe']);
    (component as any).intersectionObserver = mockObserver;
    
    component.ngOnDestroy();
    
    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should not fail if intersection observer is not set', () => {
    (component as any).intersectionObserver = undefined;
    
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
