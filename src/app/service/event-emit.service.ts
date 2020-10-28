import { EventEmitter, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class EventEmitService {
  public emitMove: EventEmitter<any>;
  public emitClick: EventEmitter<any>;
  constructor() {
    this.emitMove = new EventEmitter();
    this.emitClick = new EventEmitter();
  }
}
