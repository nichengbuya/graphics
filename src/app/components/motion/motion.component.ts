import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommandService } from 'src/app/service/command/command.service';
import { SetPositionCommand } from 'src/app/service/command/set-position-command';
import { SetRotationCommand } from 'src/app/service/command/set-rotation-command';
import { EventEmitService } from 'src/app/service/event/event-emit.service';
import { WorldService } from 'src/app/service/world/world.service';
import { Object3D, Scene, Vector3, Euler } from 'three';

@Component({
  selector: 'app-motion',
  templateUrl: './motion.component.html',
  styleUrls: ['./motion.component.scss']
})
export class MotionComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  curObj: any;
  animation: number;
  constructor(
    private worldService: WorldService,
    private eventEmitService: EventEmitService,
  ) { }

  ngOnInit(): void {
    this.worldService.setEditType('montion');
    this.curObj = this.worldService.getCurObj();
    this.subs.push(this.eventEmitService.emitClick.subscribe(e => {
      this.curObj = this.worldService.select(e);
      if (this.curObj && this.curObj?.userData.type === 'robot'){
        this.worldService.transformControls.attach(this.curObj?.userData.effector);
      }
    }));
    this.subs.push(this.eventEmitService.emitChange.subscribe(() => {
      this.leadThrough();
    }));
    // this.animate();
  }
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.stop();
  }
  // animate
  animate(){
    this.animation = requestAnimationFrame(this.animate.bind(this));
    // this.leadThrough();
  }
  stop(){
    cancelAnimationFrame(this.animation);
  }

  // robot
  leadThrough(){
    this.curObj?.userData.ik();
    this.curObj?.userData.fk();
  }

  public changeJoint(e, joint) {
    joint.setAngle(e);
    this.curObj.userData.fk();
  }


}
