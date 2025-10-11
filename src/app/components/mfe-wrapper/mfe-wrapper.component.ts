import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { MFE_CONFIGS } from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { MfeLoaderService } from '../../services/mfe-loader.service';
import { CommonModule } from '@angular/common';

interface MfeLoadState {
  name: string;
  loaded: boolean;
  loading: boolean;
  error?: string;
}

@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MfeWrapperComponent implements AfterViewInit, OnDestroy{
  // Support both single MFE (backward compatible) and multiple MFEs
  @Input() name:string | null = '';
  @Input() names: string[] = [];
  @Input() lazyLoad: boolean = true; // Enable lazy loading by default
  
  @ViewChild('container', {read:ViewContainerRef})
  remoteContainer!:ViewContainerRef

  @ViewChildren('mfeContainer', {read: ViewContainerRef})
  mfeContainers!: QueryList<ViewContainerRef>;

  @ViewChildren('mfeWrapper', {read: ElementRef})
  mfeWrappers!: QueryList<ElementRef>;

  mfeStates: MfeLoadState[] = [];
  private intersectionObserver?: IntersectionObserver;

  constructor(
    private route: ActivatedRoute,
    private mfeLoader: MfeLoaderService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }
  
  async ngAfterViewInit(){
    // Determine which MFEs to load
    let mfeNames: string[] = [];
    
    // Check for multiple MFEs input
    if (this.names && this.names.length > 0) {
      mfeNames = this.names;
    } else {
      // Single MFE mode (backward compatible)
      const mfeName = this.route.snapshot.data['mfeName'] || this.name;
      if (mfeName) {
        mfeNames = [mfeName];
      }
    }

    if (mfeNames.length === 0) {
      console.error('[MfeWrapperComponent] No MFE name(s) provided');
      return;
    }

    // Initialize MFE states
    this.mfeStates = mfeNames.map(name => ({
      name,
      loaded: false,
      loading: false
    }));
    this.cdr.detectChanges();

    // For single MFE mode, load immediately (backward compatible)
    if (mfeNames.length === 1 && this.remoteContainer) {
      await this.loadSingleMfe(mfeNames[0], this.remoteContainer);
      return;
    }

    // For multiple MFEs, setup lazy loading or load all
    if (this.lazyLoad) {
      this.setupLazyLoading();
    } else {
      // Load all MFEs immediately
      await this.loadAllMfes();
    }
  }

  /**
   * Load a single MFE (backward compatible mode)
   */
  private async loadSingleMfe(mfeName: string, container: ViewContainerRef): Promise<void> {
    // Try new config first
    const config = this.mfeLoader.getConfigByName(mfeName);
    if (config) {
      try {
        const module = await this.mfeLoader.loadMfe(config);
        if (module && module.AppComponent) {
          container.createComponent(module.AppComponent);
        }
      } catch (error) {
        console.error(`[MfeWrapperComponent] Error loading MFE ${mfeName}:`, error);
      }
      return;
    }

    // Fallback to legacy MFE loading for backward compatibility
    const mfeEntry = MFE.find(({remoteName}) => remoteName === mfeName);
    const options: LoadRemoteModuleScriptOptions | undefined = mfeEntry
      ? { remoteName: mfeEntry.remoteName, exposedModule: mfeEntry.exposedModule }
      : undefined;
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE ${mfeName} not found in configurations`);
      return;
    }
    const remote = await loadRemoteModule(options)
    container.createComponent(remote.AppComponent)
  }

  /**
   * Setup Intersection Observer for lazy loading
   */
  private setupLazyLoading(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('[MfeWrapperComponent] IntersectionObserver not supported, loading all MFEs');
      this.loadAllMfes();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-mfe-index') || '0', 10);
            if (index >= 0 && index < this.mfeStates.length) {
              const state = this.mfeStates[index];
              if (!state.loaded && !state.loading) {
                this.loadMfeAtIndex(index);
              }
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px', // Start loading 50px before element comes into view
        threshold: 0.01
      }
    );

    // Observe all MFE wrapper elements
    setTimeout(() => {
      this.mfeWrappers.forEach((wrapper) => {
        if (this.intersectionObserver) {
          this.intersectionObserver.observe(wrapper.nativeElement);
        }
      });
    }, 0);
  }

  /**
   * Load MFE at specific index
   */
  private async loadMfeAtIndex(index: number): Promise<void> {
    const state = this.mfeStates[index];
    if (state.loaded || state.loading) {
      return;
    }

    state.loading = true;
    this.cdr.detectChanges();

    try {
      const containers = this.mfeContainers.toArray();
      const container = containers[index];
      
      if (!container) {
        console.error(`[MfeWrapperComponent] Container not found for index ${index}`);
        return;
      }

      await this.loadMfeIntoContainer(state.name, container);
      state.loaded = true;
      state.loading = false;
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${state.name}:`, error);
      state.error = error instanceof Error ? error.message : 'Unknown error';
      state.loading = false;
    }
    
    this.cdr.detectChanges();
  }

  /**
   * Load all MFEs immediately (no lazy loading)
   */
  private async loadAllMfes(): Promise<void> {
    for (let i = 0; i < this.mfeStates.length; i++) {
      await this.loadMfeAtIndex(i);
    }
  }

  /**
   * Load MFE into a specific container
   */
  private async loadMfeIntoContainer(mfeName: string, container: ViewContainerRef): Promise<void> {
    // Try new config first
    const config = this.mfeLoader.getConfigByName(mfeName);
    if (config) {
      const module = await this.mfeLoader.loadMfe(config);
      if (module && module.AppComponent) {
        container.createComponent(module.AppComponent);
        return;
      }
    }

    // Fallback to legacy MFE loading
    const mfeEntry = MFE.find(({remoteName}) => remoteName === mfeName);
    if (!mfeEntry) {
      throw new Error(`MFE ${mfeName} not found in configurations`);
    }
    
    const options: LoadRemoteModuleScriptOptions = { 
      remoteName: mfeEntry.remoteName, 
      exposedModule: mfeEntry.exposedModule 
    };
    const remote = await loadRemoteModule(options);
    container.createComponent(remote.AppComponent);
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}
