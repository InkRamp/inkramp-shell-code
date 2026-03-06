import { ApplicationRef, ComponentRef, EmbeddedViewRef } from '@angular/core';
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
  let appRef: ApplicationRef;

  // Shared fake MFE component references — set up in the root beforeEach so both
  // ngAfterViewInit and ngOnDestroy describe blocks can reference them without
  // duplicating the spy setup.
  let fakeHostView: Partial<EmbeddedViewRef<unknown>>;
  let fakeDetectChanges: jasmine.Spy;
  let fakeComponentRef: Partial<ComponentRef<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfeWrapperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MfeWrapperComponent);
    component = fixture.componentInstance;
    appRef = TestBed.inject(ApplicationRef);
    fixture.detectChanges();

    // Build the shared fake component ref used across all dynamic-loading tests.
    class FakeAppComponent {}
    // rootNodes is required because the component manually appends them to the host
    // element after calling createRemoteComponent().
    fakeHostView = { rootNodes: [document.createElement('div')] };
    fakeDetectChanges = jasmine.createSpy('detectChanges');
    fakeComponentRef = {
      hostView: fakeHostView as any,
      changeDetectorRef: { detectChanges: fakeDetectChanges } as any,
      destroy: jasmine.createSpy('destroy'),
    };

    spyOn<any>(component, 'loadRemote').and.resolveTo({ AppComponent: FakeAppComponent });
    // Spy on createRemoteComponent (the protected wrapper around standalone createComponent())
    // so the test never calls the real Angular createComponent() with a fake class.
    spyOn<any>(component, 'createRemoteComponent').and.returnValue(fakeComponentRef as any);
    // Prevent real appRef methods from running with a plain fake object that
    // lacks Angular's internal view methods (attachToAppRef, detachFromAppRef).
    spyOn(appRef, 'attachView');
    spyOn(appRef, 'detachView');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    beforeEach(() => {
      component.name = 'mySales';
    });

    it('should create the MFE component using the shell EnvironmentInjector via createRemoteComponent', async () => {
      await component.ngAfterViewInit();

      expect(component['createRemoteComponent']).toHaveBeenCalledWith(jasmine.any(Function));
    });

    it('should attach the MFE host view to ApplicationRef so it is dirty-checked on every tick', async () => {
      await component.ngAfterViewInit();

      expect(appRef.attachView).toHaveBeenCalledWith(fakeHostView as any);
    });

    it('should call detectChanges() to render the MFE initial template after async load', async () => {
      await component.ngAfterViewInit();

      expect(fakeDetectChanges).toHaveBeenCalled();
    });

    it('should not throw when MFE config is not found for the given name', async () => {
      component.name = 'nonExistentMfe';
      await expectAsync(component.ngAfterViewInit()).toBeResolved();
    });
  });

  describe('ngOnDestroy', () => {
    it('should detach the MFE view from ApplicationRef and destroy the component to release resources', async () => {
      component.name = 'mySales';
      await component.ngAfterViewInit();

      component.ngOnDestroy();

      expect(appRef.detachView).toHaveBeenCalledWith(fakeHostView as any);
      expect(fakeComponentRef.destroy).toHaveBeenCalled();
    });

    it('should not throw if ngOnDestroy is called before any MFE was loaded', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
