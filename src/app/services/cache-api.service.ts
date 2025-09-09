// import { HttpClient, HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { fromEvent, Observable, tap } from 'rxjs';

// const Cache = new Map<string, HttpResponse<any>>();

// export function cacheInterceptor(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
//   console.log("Hey jude.. I am in ", req.url);

//   return next(req);
// }

import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

// export const cacheInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<any>> => {
//   try{
//     returnFromCache(req, next).then((data)=>{
//       console.log("Data...",data)
//     })
    
//   }catch(e){

//   }
//   console.log("returning what I got ...")
//   return next(req)
  /*f (req.method !== 'GET') {
    return next(req);
  }

  const cacheKey = req.urlWithParams;

  return new Observable<HttpEvent<any>>(observer => {
    // open/create a cache storage
    caches.open('http-cache').then(async cache => {
      // try to match from cache
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const body = await cachedResponse.json();
        console.log('[CACHE HIT]', cacheKey);
        observer.next(new HttpResponse({ body, status: 200, url: cacheKey }));
        observer.complete();
        return;
      }

      console.log('[CACHE MISS]', cacheKey);

      // forward to network if not cached
      next(req).subscribe({
        next: async event => {
          if (event instanceof HttpResponse) {
            // put the response into cache
            const resToCache = new Response(JSON.stringify(event.body), {
              headers: { 'Content-Type': 'application/json' }
            });
            await cache.put(cacheKey, resToCache);
            console.log('[CACHE STORE]', cacheKey);
          }
          observer.next(event);
        },
        error: err => observer.error(err),
        complete: () => observer.complete(),
      });
    });
  });*/
//};

export const cacheInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {

  return new Observable<HttpEvent<any>>(observer=>{
    let networkSub: Subscription | undefined;
    (async ()=>{
      /**
       * Start of actual Logic
       */
      const {url, urlWithParams, method} = req;
      // const k = await next(req);
      const cache = await caches.open('http')
      const cached = await cache.match(urlWithParams)
      if (cached) {
        console.log("Serve from Cache for", urlWithParams)
        let body: any;
        try { body = await cached.clone().json(); } catch { body = await cached.clone().text(); }
        observer.next(new HttpResponse({ body, status: cached.status || 200, url: req.urlWithParams }));
        observer.complete();
        return;
      }

      // 🚨 don’t `await next(req)` here — it’s an Observable
      networkSub = next(req).subscribe({
        next: async (ev: HttpEvent<any>) => {
          console.log("Cache miss for ",urlWithParams)
          observer.next(ev);
          if (ev instanceof HttpResponse && ev.ok) {
            const resToCache = new Response(JSON.stringify(ev.body), {
              headers: { 'Content-Type': 'application/json' },
              status: ev.status,
              statusText: ev.statusText
            });
            await cache.put(req.urlWithParams, resToCache);
          }
        },
        error: (err: any) => observer.error(err),
        complete: () => observer.complete()
      });
      /**
       * END OF Actual Logic
       */
    })();
    return () => networkSub?.unsubscribe()
  })
}

// export const cacheInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<any>> => {
//   return new Observable<HttpEvent<any>>(observer => {
//     let networkSub: Subscription | undefined;

//     (async () => {
//       const { url, urlWithParams, method } = req;

//       networkSub = next(req).subscribe({
//         next: ev => observer.next(ev),   // ✅ ev is HttpEvent<any>
//         error: err => observer.error(err),
//         complete: () => observer.complete()
//       });

//     })();

//     return () => networkSub?.unsubscribe();
//   });
// };

// async function returnFromCache(req : HttpRequest<any>, next:HttpHandlerFn){
  
  
//   const k = await caches.open(url)
//   const resp =  next(req)
//   console.log("Got k as ...",k,' for url ',url, "and rsp is ...",resp)
//   return resp
// }