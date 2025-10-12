import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunnyComponent } from './funny.component';

describe('FunnyComponent', () => {
  let component: FunnyComponent;
  let fixture: ComponentFixture<FunnyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunnyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FunnyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
