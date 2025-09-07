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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
