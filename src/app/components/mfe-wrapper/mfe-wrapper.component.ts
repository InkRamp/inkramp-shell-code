import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EnvironmentInjector,
  inject,
  Input,
  OnDestroy,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import MFE from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';

/** Shape of a lazily-loaded MFE remote module. */
interface RemoteModule {
  AppComponent: Type<unknown>;
}

/**
 * MFE Wrapper Component
 *
 * OnPush is safe here because the MFE's host view is attached directly to
 * ApplicationRef via appRef.attachView(). Angular checks every view in
 * ApplicationRef._views on each tick, independently of the parent wrapper's
 * CD strategy. So all async MFE operations (HTTP, timers, observables) trigger
 * CD correctly without the wrapper ever needing to be marked dirty.
 */
@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfeWrapperComponent implements AfterViewInit, OnDestroy {
  @Input() name: string | null = '';

  @ViewChild('container', { read: ViewContainerRef, static: true })
  remoteContainer!: ViewContainerRef;

  /**
   * Shell's EnvironmentInjector — passed to createComponent() so the MFE
   * resolves providers (HttpClient + bearer-token interceptor, Router, EventBus,
   * AuthService, etc.) from the same DI tree as the shell.
   */
  private readonly environmentInjector = inject(EnvironmentInjector);

  /**
   * Used to attach / detach the MFE's host view directly to Angular's application-
   * level CD graph. This guarantees the view is dirty-checked on every
   * ApplicationRef.tick() regardless of the parent wrapper's OnPush strategy.
   */
  private readonly appRef = inject(ApplicationRef);

  /** Holds the reference so ngOnDestroy can detach and destroy it. */
  private componentRef?: ComponentRef<unknown>;

  async ngAfterViewInit(): Promise<void> {
    const options: LoadRemoteModuleScriptOptions | undefined =
      MFE.find(({ remoteName }) => remoteName === this.name);

    if (!options) {
      console.error(`[MfeWrapperComponent] MFE configuration not found for: ${this.name}`);
      return;
    }

    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await this.loadRemote(options);

      if (!remote?.AppComponent) {
        console.error(`[MfeWrapperComponent] MFE module or AppComponent not found for: ${this.name}`);
        return;
      }

      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      this.componentRef = this.remoteContainer.createComponent(remote.AppComponent, {
        environmentInjector: this.environmentInjector,
      });

      // Register the MFE's host view directly in Angular's ApplicationRef CD graph.
      // Without this, the wrapper's OnPush strategy would cause Angular to skip the
      // entire embedded MFE subtree on every tick after the initial render, blocking
      // all async UI updates (HTTP responses, timers, observables) inside the MFE.
      this.appRef.attachView(this.componentRef.hostView);

      // Trigger an immediate CD cycle to render the MFE's initial template.
      // ngAfterViewInit is async — Angular's synchronous CD pass has already
      // completed by the time the remote module resolves.
      this.componentRef.changeDetectorRef.detectChanges();
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }

  ngOnDestroy(): void {
    if (this.componentRef) {
      // Detach from ApplicationRef's CD graph first to prevent "attempt to use a
      // destroyed view" errors from any in-flight CD cycle, then destroy the
      // component so its own ngOnDestroy runs and subscriptions are released.
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
    }
  }

  /** Protected so tests can spy on it without touching the non-configurable ES module export. */
  protected loadRemote(options: LoadRemoteModuleScriptOptions): Promise<RemoteModule> {
    return loadRemoteModule(options) as Promise<RemoteModule>;
  }
}