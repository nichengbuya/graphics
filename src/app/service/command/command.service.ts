import { EventEmitter, Injectable } from '@angular/core';
import { Object3D } from 'three';
import { WorldService } from '../world/world.service';
export interface Command {
  object: Object3D;
  // inMemory: boolean;
  type: string;
  fromJSON: () => {};
  toJSON: () => {};
  execute: () => {};
  undo: () => {};
}
@Injectable({
  providedIn: 'root'
})
export class CommandService {
  undos: Command[] = [];
  redos: Command[] = [];
  commandEmit: EventEmitter<any> = new EventEmitter();
  // lastCmdTime = new Date();
  // idCounter = 0;
  // historyDisabled = false;
  constructor(
  ) { }
  execute(cmd) {
    this.undos.push(cmd);
    // cmd.execute();
    // clearing all the redo-commands
    this.redos = [];
    this.commandEmit.emit();
  }
  selectCommond(index){
    if (index < this.undos.length){
      while (this.undos.length > index + 1){
        this.undo();
      }
    }else{
      while (this.undos.length < index + 1){
        this.redo();
      }
    }
  }
  undo() {
    let cmd: Command;
    if (this.undos.length > 0) {
      cmd = this.undos.pop();
      cmd.undo();
      this.redos.push(cmd);

      this.commandEmit.emit();
    } else {
      return;
    }
    return cmd;
  }
  redo() {
    let cmd: Command;
    if (this.redos.length > 0) {
      cmd = this.redos.pop();
      cmd.execute();
      this.undos.push(cmd);
      this.commandEmit.emit();
    }else{
      return;
    }
    return cmd;
  }
  clear() {

    this.undos = [];
    this.redos = [];
    // this.idCounter = 0;
  }


}
