import { Injectable } from '@angular/core';
import { Object3D } from 'three';
import { WorldService } from '../world/world.service';
interface Command{
  updatable: boolean;
  object: Object3D;
  inMemory: boolean;
  type: string;
  script: string;
  attributeName: string;
  fromJSON: () => {};
  toJSON: () => {};
  excute: () => {};
  undo: () => {};
}
@Injectable({
  providedIn: 'root'
})
export class CommandService {
  undos: Command[] = [];
  redos: [] = [];
  lastCmdTime = new Date();
  idCounter = 0;
  historyDisabled = false;
  constructor(
    private worldService: WorldService
  ) { }
  excute(cmd, optionalName){
    const lastCmd = this.undos[this.undos.length - 1];
    const timeDifference = new Date().getTime() - this.lastCmdTime.getTime();
    const isUpdatableCmd = lastCmd &&
    lastCmd.updatable &&
    cmd.updatable &&
    lastCmd.object === cmd.object &&
    lastCmd.type === cmd.type &&
    lastCmd.script === cmd.script &&
    lastCmd.attributeName === cmd.attributeName;
    cmd.excute();
    cmd.inMemory = true;
    this.lastCmdTime = new Date();
    this.redos = [];
  }
  undo(){
    let cmd: Command;
    if (this.undos.length > 0){
      cmd = this.undos.pop();
      if ( !cmd.inMemory ){

      }
    }
  }
  redo(){
    let cmd: Command;
    if (this.redos.length > 0){
      cmd = this.redos.pop();
    }
    if (cmd !== undefined){
      cmd.excute();
      this.undos.push(cmd);
    }
    return cmd;
  }


}
