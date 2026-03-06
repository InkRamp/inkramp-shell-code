import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnvironmentInjector, ViewContainerRef } from '@angular/core';
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
    it('should create the MFE component with environmentInjector and call detectChanges() to render the initial view', async () => {
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

      // Assert: createComponent was called with environmentInjector and detectChanges() was called
      expect(createComponentSpy).toHaveBeenCalledWith(
        jasmine.any(Function),
        jasmine.objectContaining({ environmentInjector: jasmine.any(EnvironmentInjector) })
      );
      expect(fakeDetectChanges).toHaveBeenCalled();
    });

    it('should not throw when MFE config is not found for the given name', async () => {
      component.name = 'nonExistentMfe';
      await expectAsync(component.ngAfterViewInit()).toBeResolved();
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear the remote container to release MFE resources', () => {
      const clearSpy = spyOn(component['remoteContainer'] as ViewContainerRef, 'clear');
      component.ngOnDestroy();
      expect(clearSpy).toHaveBeenCalled();
    });
  });
});
