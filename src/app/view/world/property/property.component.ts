import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventEmitService } from 'src/app/service/event-emit.service';
import { WorldService } from 'src/app/service/world.service';
import { Object3D } from 'three';
interface Pose{
  key: string;
  value: number;
  unit: string;
}
@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  public curObj: Object3D;
  pose: Pose[];
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
      console.log(this.curObj);
    }));
  }
  ngOnDestroy(){
    this.subs.forEach(s => s.unsubscribe());
  }
  public changeJoint(e, joint){
    joint.setAngle(e);
  }
  public formatePose(){
    if (this.curObj){
      this.pose = [
        {
          key: 'x',
          value: this.curObj.position.x * 1000,
          unit: 'mm'
        },
        {
          key: 'y',
          value: this.curObj.position.y * 1000,
          unit: 'mm'
        },
        {
          key: 'z',
          value: this.curObj.position.z * 1000,
          unit: 'mm'
        },
        {
          key: 'r',
          value: this.curObj.rotation.x * 180 / Math.PI,
          unit: '°'
        },
        {
          key: 'p',
          value: this.curObj.rotation.y * 180 / Math.PI,
          unit: '°'
        },
        {
          key: 'y',
          value: this.curObj.rotation.z * 180 / Math.PI,
          unit: '°'
        },

      ]
    }

  }
}
