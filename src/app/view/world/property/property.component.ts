import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandService } from 'src/app/service/command/command.service';
import { SetPositionCommand } from 'src/app/service/command/set-position-command';
import { SetRotationCommand } from 'src/app/service/command/set-rotation-command';
import { EventEmitService } from 'src/app/service/event-emit.service';
import { WorldService } from 'src/app/service/world/world.service';
import { Euler, Object3D, Vector3 } from 'three';
interface Pose{
  key: string;
  value: number;
  unit: string;
  lower: number;
  upper: number;
}
@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  public curObj: Object3D;
  pose;
  poseMap;
  constructor(
    private eventEmitService: EventEmitService,
    private worldService: WorldService,
    private commandService: CommandService
  ) { }

  ngOnInit(): void {
    this.curObj = this.worldService.curObj;
    this.formatePose();
    this.subs.push(this.eventEmitService.emitClick.subscribe(e => {
      this.curObj = this.worldService.select(e);
      this.formatePose();
    }));
  }
  ngOnDestroy(){
    this.subs.forEach(s => s.unsubscribe());
  }
  public changeJoint(e, joint){
    joint.setAngle(e);
    this.curObj.userData.fk();
  }
  public changePose(e, p){
    let oldPosition: Vector3;
    let oldRotation: Euler;
    switch (p.key){
      case 'x': {
        oldPosition = this.curObj.position.clone();
        this.curObj.position.x =  e / 1000;
        this.commandService.execute(new SetPositionCommand(this.curObj, this.curObj.position, oldPosition));
        break;
      }
      case 'y': {
        oldPosition = this.curObj.position.clone();
        this.curObj.position.y =  e / 1000;
        this.commandService.execute(new SetPositionCommand(this.curObj, this.curObj.position, oldPosition));
        break;
      }
      case 'z': {
        oldPosition = this.curObj.position.clone();
        this.curObj.position.z =  e / 1000;
        this.commandService.execute(new SetPositionCommand(this.curObj, this.curObj.position, oldPosition));
        break;
      }
      case 'roll': {
        oldRotation = this.curObj.rotation.clone();
        this.curObj.rotation.x =  e * Math.PI / 180;
        this.commandService.execute(new SetRotationCommand(this.curObj, this.curObj.rotation, oldRotation));
        break;
      }
      case 'pitch': {
        oldRotation = this.curObj.rotation.clone();
        this.curObj.rotation.y =  e * Math.PI / 180;
        this.commandService.execute(new SetRotationCommand(this.curObj, this.curObj.rotation, oldRotation));
        break;
      }
      case 'yaw': {
        oldRotation = this.curObj.rotation.clone();
        this.curObj.rotation.z =  e * Math.PI / 180;
        this.commandService.execute(new SetRotationCommand(this.curObj, this.curObj.rotation, oldRotation));
        break;
      }
    }
  }
  public formatePose(){
    const { curObj } = this;
    if (curObj){
      this.pose = [
        {
          key: 'x',
          get value(){
            return curObj.position.x * 1000;
          } ,
          unit: 'mm',
          lower: -10000,
          upper: 10000,
        },
        {
          key: 'y',
          get value(){
            return curObj.position.y * 1000;
          } ,
          unit: 'mm',
          lower: -10000,
          upper: 10000,
        },
        {
          key: 'z',
          get value(){
            return curObj.position.z * 1000;
          } ,
          unit: 'mm',
          lower: 0,
          upper: 10000,
        },
        {
          key: 'roll',
          get value(){
            return curObj.rotation.x * 180 / Math.PI;
          } ,
          unit: '°',
          lower: -360,
          upper: 360,
        },
        {
          key: 'pitch',
          get value(){
            return curObj.rotation.y * 180 / Math.PI;
          } ,
          unit: '°',
          lower: -360,
          upper: 360,
        },
        {
          key: 'yaw',
          get value(){
            return curObj.rotation.z * 180 / Math.PI;
          } ,
          unit: '°',
          lower: -360,
          upper: 360,
        },

      ];
    }

  }
}
