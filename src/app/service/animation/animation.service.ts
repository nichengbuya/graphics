import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tween } from 'src/app/common/tween';
import { AnimationClip, AnimationMixer, KeyframeTrack, NumberKeyframeTrack, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from 'three';
import { WorldService } from '../world/world.service';
import { Point } from 'src/app/components/point-list/point-list.component';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor(
    private world: WorldService
  ) { }
  movePTP(target:Point,duration:number, robot) {
    const joints = robot.userData.joints;
    let from = {}, to = {};
    for (let i = 0; i < joints.length; i++) {
      from[`j${i}`] = joints[i].jointValue;
      to[`j${i}`] = target.joints[i].jointValue;
    }
    return new Promise((resolve, reject) => {
      tween({
        from, to, duration
      }, ({ j0, j1, j2, j3, j4, j5 }) => {
          joints[0].setAngle(j0);
          joints[1].setAngle(j1);
          joints[2].setAngle(j2);
          joints[3].setAngle(j3);
          joints[4].setAngle(j4);
          joints[5].setAngle(j5);
          robot.userData.fk();
      }, () => {
        resolve(new Subject())
      })
    })

  }
  moveLiner(target:Point,duration:number,robot){

  }
  moveCircle(){

  }
  gripperOpen(){
    
  }
}
