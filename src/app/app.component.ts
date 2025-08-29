import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation-runtime';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone:true,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'shell-module';

  @ViewChild('remoteContainer', { read: ViewContainerRef, static: true })
  remoteContainer!: ViewContainerRef;

  async ngAfterViewInit() {
    const remote = await loadRemoteModule({
      remoteName: 'pokemon',
      exposedModule: './Component',   // component exposed directly
    });

    const componentType = remote.AppComponent;
    this.remoteContainer.createComponent(componentType);
  }
}
