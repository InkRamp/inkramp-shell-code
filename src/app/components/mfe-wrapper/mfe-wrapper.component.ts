import {
  AfterViewInit,
  Component,
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
 * IMPORTANT — Do NOT add ChangeDetectionStrategy.OnPush to this component.
 * The wrapper hosts dynamically-loaded MFE content that updates asynchronously
 * (HTTP responses, timers, etc.). With OnPush, Angular only re-checks this
 * component when its @Input changes or markForCheck() is explicitly called.
 * After the initial render, the wrapper would never be marked dirty, so the
 * entire embedded MFE subtree would be skipped on every subsequent CD cycle,
 * blocking all async UI updates inside the MFE.
 */
@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
})
export class MfeWrapperComponent implements AfterViewInit, OnDestroy {
  @Input() name: string | null = '';

  @ViewChild('container', { read: ViewContainerRef, static: true })
  remoteContainer!: ViewContainerRef;

  /**
   * The shell's EnvironmentInjector is explicitly passed to createComponent()
   * so the MFE inherits the shell's HttpClient (with the bearer-token interceptor),
   * Router, and all other singleton providers (EventBus, AuthService, etc.).
   */
  private readonly environmentInjector = inject(EnvironmentInjector);

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
      const componentRef = this.remoteContainer.createComponent(remote.AppComponent, {
        environmentInjector: this.environmentInjector,
      });

      // ngAfterViewInit is async — Angular's synchronous CD pass has already
      // completed by the time the remote module resolves. Call detectChanges()
      // to trigger an immediate CD cycle and render the MFE's initial template.
      componentRef.changeDetectorRef.detectChanges();
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }

  ngOnDestroy(): void {
    // Explicitly clear the container so the MFE component's ngOnDestroy runs
    // and subscriptions/resources are properly released when navigating away.
    this.remoteContainer.clear();
  }

  /** Protected so tests can spy on it without touching the non-configurable ES module export. */
  protected loadRemote(options: LoadRemoteModuleScriptOptions): Promise<RemoteModule> {
    return loadRemoteModule(options) as Promise<RemoteModule>;
  }
}