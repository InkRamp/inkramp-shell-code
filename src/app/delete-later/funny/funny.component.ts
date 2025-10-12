import { Component, DestroyRef } from '@angular/core';
import { EventBusService } from '@org/core-services';
import { filter } from 'rxjs';
import { EventType } from 'mitt';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-funny',
  standalone: true,
  imports: [],
  templateUrl: './funny.component.html',
  styleUrl: './funny.component.scss'
})
export class FunnyComponent {
    constructor(
      private eventBus: EventBusService,
      private destroyRef:DestroyRef
    ){
      this.eventBus.onePlusNEvents.pipe(takeUntilDestroyed(this.destroyRef),filter(e=> (e === 'JOJO'))).subscribe(this.catchJojo)
    }
    catchJojo(e:EventType){
      console.log("PUTIN!!")
    }
}
