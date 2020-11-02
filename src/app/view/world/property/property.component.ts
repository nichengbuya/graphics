import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitService } from 'src/app/service/event-emit.service';
import { WorldService } from 'src/app/service/world/world.service';
import { Object3D } from 'three';
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
    private worldService: WorldService
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
  }
  public changePose(e, p){
    switch (p.key){
      case 'x': {
        this.curObj.position.x =  e / 1000;
        break;
      }
      case 'y': {
        this.curObj.position.y =  e / 1000;
        break;
      }
      case 'z': {
        this.curObj.position.z =  e / 1000;
        break;
      }
      case 'roll': {
        this.curObj.rotation.x =  e * Math.PI / 180;
        break;
      }
      case 'pitch': {
        this.curObj.rotation.y =  e * Math.PI / 180;
        break;
      }
      case 'yaw': {
        this.curObj.rotation.z =  e * Math.PI / 180;
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
