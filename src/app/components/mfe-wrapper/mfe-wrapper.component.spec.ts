import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewContainerRef } from '@angular/core';
import { MfeWrapperComponent } from './mfe-wrapper.component';

/**
 * MFE Wrapper Tests
 * NOTE: Tests simplified - MfeLoaderService removed
 */
describe('MfeWrapperComponent', () => {
  let component: MfeWrapperComponent;
  let fixture: ComponentFixture<MfeWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfeWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MfeWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should call detectChanges() on the created componentRef so the MFE view is attached to the active CD tree', async () => {
      // Arrange
      class FakeAppComponent {}
      const fakeDetectChanges = jasmine.createSpy('detectChanges');
      const fakeComponentRef = { changeDetectorRef: { detectChanges: fakeDetectChanges } };

      // Spy on the protected loadRemote wrapper so we never touch the non-configurable ES module export
      spyOn<any>(component, 'loadRemote').and.resolveTo({ AppComponent: FakeAppComponent });

      const createComponentSpy = spyOn(component['remoteContainer'] as ViewContainerRef, 'createComponent')
        .and.returnValue(fakeComponentRef as any);

      component.name = 'mySales';

      // Act
      await component.ngAfterViewInit();

      // Assert: component was created and detectChanges() was called to attach the embedded view
      expect(createComponentSpy).toHaveBeenCalledWith(jasmine.any(Function));
      expect(fakeDetectChanges).toHaveBeenCalled();
    });

    it('should not throw when MFE config is not found for the given name', async () => {
      component.name = 'nonExistentMfe';
      await expectAsync(component.ngAfterViewInit()).toBeResolved();
    });
  });
});
