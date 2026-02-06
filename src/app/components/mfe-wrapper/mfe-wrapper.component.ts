import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EnvironmentInjector, Input, OnInit, Output, ViewChild, ViewContainerRef, createComponent, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { MFE_CONFIGS } from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { MfeLoaderService } from '@org/core-services';
import { CommonModule } from '@angular/common';

/**
 * MFE Wrapper Component with Error Boundary
 * Handles dynamic loading of Module Federation remotes with graceful error handling
 * Prevents individual MFE failures from crashing the entire application
 */
@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MfeWrapperComponent implements AfterViewInit{
  @Input() name:string | null = '';
  @ViewChild('container', {read:ViewContainerRef, static:true})
  remoteContainer!:ViewContainerRef

  // Error boundary state
  isLoading = signal(true);
  hasError = signal(false);
  errorMessage = signal<string>('');
  errorDetails = signal<any>(null);

  constructor(
    private environmentInjector: EnvironmentInjector,
    private cdr: ChangeDetectorRef
  ) {}

  async ngAfterViewInit(){
    await this.loadMfe();
  }

  /**
   * Load the MFE component
   * Extracted from ngAfterViewInit to allow retry functionality
   */
  private async loadMfe(): Promise<void> {
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.find(({remoteName})=>remoteName===this.name)
    if(!options) {
      const errorMsg = `MFE configuration not found for: ${this.name}`;
      console.error(`[MfeWrapperComponent] ${errorMsg}`);
      this.handleError(errorMsg, { name: this.name, options: null });
      return;
    }
    
    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await loadRemoteModule(options);
      
      if (!remote || !remote.AppComponent) {
        const errorMsg = `MFE module or AppComponent not found for: ${this.name}`;
        console.error(`[MfeWrapperComponent] ${errorMsg}`);
        this.handleError(errorMsg, { name: this.name, remote });
        return;
      }
      
      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      
      // Use createComponent with proper injector to avoid JIT compiler issues
      // This ensures the component is created with the correct environment injector
      const componentRef = createComponent(remote.AppComponent, {
        environmentInjector: this.environmentInjector,
        elementInjector: this.remoteContainer.injector
      });
      
      // Attach the component to the view container
      this.remoteContainer.insert(componentRef.hostView);
      
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
      this.isLoading.set(false);
      this.cdr.markForCheck();
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
      this.handleError(`Failed to load MFE: ${this.name}`, error);
    }
  }

  /**
   * Handle MFE loading errors gracefully
   * Displays user-friendly error message without crashing the app
   */
  private handleError(message: string, details: any): void {
    this.hasError.set(true);
    this.isLoading.set(false);
    this.errorMessage.set(message);
    this.errorDetails.set(details);
    
    // Log detailed error for debugging
    console.error('[MfeWrapperComponent] Error Details:', {
      message,
      details,
      timestamp: new Date().toISOString()
    });
    
    this.cdr.markForCheck();
  }

  /**
   * Retry loading the MFE
   */
  retryLoad(): void {
    this.hasError.set(false);
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.errorDetails.set(null);
    this.cdr.markForCheck();
    
    // Clear the container and retry loading
    this.remoteContainer.clear();
    this.loadMfe();
  }

  /*constructor(
    private route: ActivatedRoute,
    private mfeLoader: MfeLoaderService
  ) {
    // Initialize MFE configs
    this.mfeLoader.setConfigs(MFE_CONFIGS);
  }
  
  async ngAfterViewInit(){
    // Get MFE name from route data or input
    const mfeName = this.route.snapshot.data['mfeName'] || this.name;
    
    if (!mfeName) {
      console.error('[MfeWrapperComponent] No MFE name provided');
      return;
    }

    // Try new config first
    const config = this.mfeLoader.getConfigByName(mfeName);
    if (config) {
      try {
        const module = await this.mfeLoader.loadMfe(config);
        if (module && module.AppComponent) {
          this.remoteContainer.createComponent(module.AppComponent);
        }
      } catch (error) {
        console.error(`[MfeWrapperComponent] Error loading MFE ${mfeName}:`, error);
      }
      return;
    }

    // Fallback to legacy MFE loading for backward compatibility
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.map(({remoteName, exposedModule})=>({remoteName, exposedModule})).find(({remoteName})=>remoteName===mfeName)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE ${mfeName} not found in configurations`);
      return;
    }
    const remote = await loadRemoteModule(options)
    this.remoteContainer.createComponent(remote.AppComponent)
  }*/
  
}