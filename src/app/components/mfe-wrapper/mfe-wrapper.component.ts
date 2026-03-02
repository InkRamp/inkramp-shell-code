import { AfterViewInit, ChangeDetectionStrategy, Component, EnvironmentInjector, inject, Input, ViewChild, ViewContainerRef } from '@angular/core';
import MFE from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';
import { CommonModule } from '@angular/common';

/**
 * MFE Wrapper Component
 * NOTE: MfeLoaderService removed - using direct MFE configuration
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

  private readonly environmentInjector = inject(EnvironmentInjector);

  async ngAfterViewInit(){
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.find(({remoteName})=>remoteName===this.name)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE configuration not found for: ${this.name}`);
      return;
    }
    
    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await loadRemoteModule(options);
      
      if (!remote || !remote.AppComponent) {
        console.error(`[MfeWrapperComponent] MFE module or AppComponent not found for: ${this.name}`);
        return;
      }
      
      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      this.remoteContainer.createComponent(remote.AppComponent, {
        environmentInjector: this.environmentInjector
      });
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }
}