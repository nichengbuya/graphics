import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EventEmitService {
  public emitMove: EventEmitter<any>;
  public emitClick: EventEmitter<any>;
  public emitChange: EventEmitter<any>;
  public sceneChange: EventEmitter<any>;
  public movement: Subject<any>
  constructor() {
    this.emitMove = new EventEmitter();
    this.emitClick = new EventEmitter();
    this.emitChange = new EventEmitter();
    this.sceneChange = new EventEmitter();
    this.movement = new EventEmitter();
  }
}
