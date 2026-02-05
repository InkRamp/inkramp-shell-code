import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, Output, ViewChild, ViewContainerRef, ComponentRef, Type, Injector, EnvironmentInjector, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { MFE_CONFIGS } from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { MfeLoaderService } from '@org/core-services';
import { CommonModule } from '@angular/common';

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
  
  private injector = inject(EnvironmentInjector);

  async ngAfterViewInit(){
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.find(({remoteName})=>remoteName===this.name)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE configuration not found for: ${this.name}`);
      return;
    }
    
    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await loadRemoteModule(options);
      
      if (!remote) {
        console.error(`[MfeWrapperComponent] MFE module not found for: ${this.name}`);
        return;
      }
      
      // Try different possible component export names
      let componentType: Type<any> | undefined;
      if (remote.AppComponent) {
        componentType = remote.AppComponent;
      } else if (remote.Component) {
        componentType = remote.Component;
      } else if (remote.default) {
        componentType = remote.default;
      }
      
      if (!componentType) {
        console.error(`[MfeWrapperComponent] No component found in remote module for: ${this.name}. ` +
          `Checked for: AppComponent, Component, default. Available exports:`, Object.keys(remote));
        return;
      }
      
      console.log(`[MfeWrapperComponent] Found component type for MFE: ${this.name}`);
      
      // Check if the component is standalone
      const isStandalone = (componentType as any).ɵcmp?.standalone === true;
      
      if (!isStandalone) {
        console.error(`[MfeWrapperComponent] ⚠️ CRITICAL ERROR: Component ${this.name} is NOT a standalone component. ` +
          `This will cause "JIT compiler unavailable" errors in production builds. ` +
          `\n\nTo fix this issue, the remote MFE must:` +
          `\n1. Mark the component with 'standalone: true' in the @Component decorator` +
          `\n2. Import all dependencies in the component's 'imports' array` +
          `\n3. Rebuild and redeploy the MFE` +
          `\n\nExample:` +
          `\n@Component({` +
          `\n  selector: 'app-root',` +
          `\n  standalone: true,` +
          `\n  imports: [CommonModule, RouterModule, ...],` +
          `\n  templateUrl: './app.component.html'` +
          `\n})`);
        throw new Error(`Component ${this.name} must be a standalone component for Module Federation in production builds`);
      }
      
      console.log(`[MfeWrapperComponent] ✓ Component is standalone. Creating component for MFE: ${this.name}`);
      
      // Create component with environment injector for standalone components
      const componentRef: ComponentRef<any> = this.remoteContainer.createComponent(componentType, {
        environmentInjector: this.injector
      });
      
      console.log(`[MfeWrapperComponent] ✓ MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] ❌ Error loading MFE ${this.name}:`, error);
      
      // Add helpful error message to the UI
      this.remoteContainer.clear();
      
      // Optionally, you could create an error component here to display to users
      // For now, just log and re-throw
      throw error;
    }
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