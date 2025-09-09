import { Component, DestroyRef, effect, EventEmitter, Input, OnInit, Output, Signal, WritableSignal, signal } from '@angular/core';
import { Pokemon, PokemonService } from './pokemon.service';
import { Router } from '@angular/router';
import { EventBusService } from '../../services/event-bus.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { map, combineLatest, debounce, debounceTime, distinctUntilChanged, filter, fromEvent, takeLast, takeUntil, throttle, throttleTime, EMPTY, of } from 'rxjs';

@Component({
  selector: 'app-lazyload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lazyload.component.html',
  styleUrl: './lazyload.component.scss'
})
export class LazyloadComponent{
  // @Input() messageFromParent:string | null = '';
  // @Output() acknowledge:EventEmitter<string> = new EventEmitter();
  //public pokemons: WritableSignal<Pokemon[]> = signal<Pokemon[]>([]);
  constructor(
    public pokemonService:PokemonService,
    private destroyRef:DestroyRef
  ){
    

    fromEvent(window,'scroll').pipe(
      takeUntilDestroyed(this.destroyRef),
      map(() => window.scrollY + window.innerHeight >= document.body.scrollHeight),
      distinctUntilChanged(),                // only emit when the "atBottom" state changes
      filter(atBottom => atBottom === true)  // only fire when we *enter* bottom state
    ).subscribe(()=>{
      //this.fetchMore()
      this.pokemonService.$loadMoreEvent.next('loadMore')
    })
    console.log('LazyloadComponent constructed');
  }
  public referId(index:number, p:Pokemon):string{
    return p.name
  }
  //ngOnInit(): void {}
  // fetchMore(){
  //   console.log("Fetching more...")
  //   this.pokemonService.getFresh().subscribe((p)=>{
  //     console.log("Old 1 is ",this.pokemons()[0])
  //     console.log("New 1 is ",p[0])
  //     this.pokemons.update((old)=>[...old,...p])
  //   })
  //}

  
  ngOnInit() {
    console.log('LazyloadComponent initialized');
  }
  
  ngOnDestroy() {
    console.log('LazyloadComponent destroyed');
  }
}
