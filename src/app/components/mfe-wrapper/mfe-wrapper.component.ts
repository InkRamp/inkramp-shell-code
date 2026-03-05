import { AfterViewInit, ChangeDetectionStrategy, Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
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

  async ngAfterViewInit(){
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.find(({remoteName})=>remoteName===this.name)
    if(!options) {
      console.error(`[MfeWrapperComponent] MFE configuration not found for: ${this.name}`);
      return;
    }
    
    try {
      console.log(`[MfeWrapperComponent] Loading MFE: ${this.name}`, options);
      const remote = await loadRemoteModule(options);
      
      // Support both named export (AppComponent) and default export
      const componentClass = remote?.AppComponent ?? remote?.default;
      if (!componentClass) {
        console.error(`[MfeWrapperComponent] No component found in MFE module for: ${this.name}`);
        return;
      }
      
      console.log(`[MfeWrapperComponent] Creating component for MFE: ${this.name}`);
      const componentRef = this.remoteContainer.createComponent(componentClass);
      // Trigger change detection so the dynamically created component's
      // lifecycle hooks (e.g. ngOnInit) run and its view is rendered.
      componentRef.changeDetectorRef.detectChanges();
      console.log(`[MfeWrapperComponent] MFE loaded successfully: ${this.name}`);
    } catch (error) {
      console.error(`[MfeWrapperComponent] Error loading MFE ${this.name}:`, error);
    }
  }
}