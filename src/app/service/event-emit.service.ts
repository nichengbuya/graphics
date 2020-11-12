import { EventEmitter, Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class EventEmitService {
  public emitMove: EventEmitter<any>;
  public emitClick: EventEmitter<any>;
  public emitChange: EventEmitter<any>;
  public sceneChange: EventEmitter<any>;
  constructor() {
    this.emitMove = new EventEmitter();
    this.emitClick = new EventEmitter();
    this.emitChange = new EventEmitter();
    this.sceneChange = new EventEmitter();
  }
}
