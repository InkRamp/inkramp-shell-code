import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import MFE, {InterfaceMfeUrl} from '../../../configs/mfe';
import { loadRemoteModule, LoadRemoteModuleScriptOptions } from '@angular-architects/module-federation';

@Component({
  selector: 'app-mfe-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './mfe-wrapper.component.html',
  styleUrl: './mfe-wrapper.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class MfeWrapperComponent implements AfterViewInit{
  @Input() name:string | null = '';
  @ViewChild('container', {read:ViewContainerRef, static:true})
  remoteContainer!:ViewContainerRef

  //constructor(){}
  
  async ngAfterViewInit(){
    const options:LoadRemoteModuleScriptOptions | undefined = MFE.map(({remoteName, exposedModule})=>({remoteName, exposedModule})).find(({remoteName})=>remoteName===this.name)
    if(!options) return;
    const remote = await loadRemoteModule(options)
    this.remoteContainer.createComponent(remote.AppComponent)
  }
  
}
