import { Component, DestroyRef, effect, EventEmitter, Input, OnInit, Output, Signal, WritableSignal, signal } from '@angular/core';
import { Pokemon, PokemonService } from './pokemon.service';
import { Router } from '@angular/router';
import { EventBusService } from '../../services/event-bus.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { map, combineLatest, debounce, debounceTime, distinctUntilChanged, filter, fromEvent, takeLast, takeUntil, throttle, throttleTime, EMPTY, of } from 'rxjs';
import { SseFromEventService } from '../../services/sse-event-from.service';
import { SseControlService } from '../../services/sse-event-from.service2';

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
  messages: string[] = [];
  constructor(
    public pokemonService:PokemonService,
    private destroyRef:DestroyRef,
    private sseService: SseControlService,
  ){
    
    // // Create EventSource
    //   const es = new EventSource('https://echo.websocket.org/.sse');

    //   // Wrap message events into observable
    //   const sse$ = fromEvent<MessageEvent>(es, 'message');

    //   // Subscribe
    //   sse$.subscribe({
    //     next: (event) => console.log('SSE message:', event.data),
    //     error: (err) => console.error('SSE error:', err),
    //   });

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

  
  ngOnInit(): void {
    // Use this if you are using the sse without start and stop. Use this if you are using SseFromEventService
    // this.sseService.listen()
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: (msg: MessageEvent) => {
    //       console.log('SSE incoming:', msg);  // 👀 should log live JSON
    //       this.messages.push(msg.data);
    //     },
    //     error: (err) => console.error('SSE error', err)
    //   });
  }

  /**
   * Start and Stop for SSE
   */
  start() {
    this.sseService.start('https://stream.wikimedia.org/v2/stream/recentchange')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: msg => {
          console.log('SSE:', msg);
          this.messages.push(msg);
        },
        error: err => console.error('SSE error', err)
      });
  }

  stop() {
    console.log('SSE stopped');
    this.sseService.stop();
  }
  
  
  ngOnDestroy() {
    console.log('LazyloadComponent destroyed');
  }
}
