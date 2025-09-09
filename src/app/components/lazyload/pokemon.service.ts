import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, debounce, debounceTime, EMPTY, map, Observable, tap } from 'rxjs';

export interface Pokemon{
  name:string;
  url:string;
}
interface PokemonResponse{
  count:number;
  next: string | undefined;
  previous: string | null;
  results:Pokemon[];
}
@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  public $masterSet:BehaviorSubject<Pokemon[]> = new BehaviorSubject<Pokemon[]>([]);
  public $loadMoreEvent:BehaviorSubject<string> = new BehaviorSubject('');
  private url:string = 'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20';
  private next: string | undefined;
  private previous: string | undefined;
  
  constructor(
    private $http:HttpClient
  ) { 
    this.$http.get<PokemonResponse>(this.url).pipe(
      tap(({next,previous})=>{this.next=next;}),
      map(({results})=>results)
    ).subscribe((pokemons)=>this.$masterSet.next(pokemons))

    this.$loadMoreEvent.pipe(debounceTime(500)).subscribe((e)=>{
      if(e === 'loadMore') this.loadMore()
    })
  }

  loadMore(){
    if(this.next) this.$http.get<PokemonResponse>(this.next).pipe(tap(({next})=>{
      this.next = next;
    }),
    map(({results})=>results)
   ).subscribe((p)=>{
    this.$masterSet.next([...this.$masterSet.value,...p])
   })
  }

}
