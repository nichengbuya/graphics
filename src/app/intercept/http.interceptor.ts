import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CommonInterceptor implements HttpInterceptor{
  constructor(){}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse){

        }
      }, error => {
        if (error instanceof HttpErrorResponse){
          if (error.status === 401){

          }
        }
      })
    );
  }
}
