import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MfeWrapperComponent } from './mfe-wrapper.component';

describe('MfeWrapperComponent', () => {
  let component: MfeWrapperComponent;
  let fixture: ComponentFixture<MfeWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfeWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MfeWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default name value', () => {
    expect(component.name).toBe('');
  });

  it('should accept name input', () => {
    component.name = 'pokemon';
    expect(component.name).toBe('pokemon');
  });
});
