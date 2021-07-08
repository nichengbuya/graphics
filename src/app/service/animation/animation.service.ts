import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { tween } from 'src/app/common/tween';
import { AnimationClip, AnimationMixer, KeyframeTrack, NumberKeyframeTrack, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack, Object3D, CatmullRomCurve3, Geometry, Line, LineBasicMaterial, LoopOnce } from 'three';
import { Point } from 'src/app/components/point-list/point-list.component';
import { COLOR } from 'src/app/common/utils';
import { WorldService } from '../world/world.service';
import { EventEmitService } from '../event/event-emit.service';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  line: Line[] = [];
  constructor(
    private worldService: WorldService,
    private eventEmitService: EventEmitService,
  ) { }

  public movePTP(target: Point, duration: number, robot: Object3D) {
    const joints = robot.userData.joints;
    const from = {}, to = {};
    for (let i = 0; i < joints.length; i++) {
      from[`j${i}`] = joints[i].jointValue;
      to[`j${i}`] = target.joints[i].jointValue;
    }
    this.worldService.changeColor(target.mesh, 0xffff00);
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
        this.worldService.restoreColor(target.mesh);
        resolve(true);
      });
    });
  }

  public getLinerTrajectory(pointList: Point[], currentPosition){
    let linerPoints = [];
    const points = pointList.map(p => {
      return p.position;
    });
    points.unshift(currentPosition);
    for (let i = 1; i < points.length; i++){
      const curve = new CatmullRomCurve3([
        points[i - 1],
        points[i]
      ]);

      linerPoints = [...linerPoints, ...curve.getPoints(2)];
    }
    return linerPoints;
  }

  getLiner(target: Point, currentPosition){
    const curve = new CatmullRomCurve3([
      currentPosition,
      target.position
    ]);
    return curve.getPoints(2);
  }

  private getCircleTrajectory(pointList: Point[], currentPos){
      const targetPos = pointList[1].position;
      const viaPos = pointList[0].position;
      if (currentPos.x.toFixed(3) === targetPos.x.toFixed(3)) { return; }
      let a1, b1, c1, d1;
      let a2, b2, c2, d2;
      let a3, b3, c3, d3;

      const x1 = targetPos.x, y1 = targetPos.y, z1 = targetPos.z;
      const x2 = viaPos.x, y2 = viaPos.y, z2 = viaPos.z;
      const x3 = currentPos.x, y3 = currentPos.y, z3 = currentPos.z;

      a1 = (y1 * z2 - y2 * z1 - y1 * z3 + y3 * z1 + y2 * z3 - y3 * z2);
      b1 = -(x1 * z2 - x2 * z1 - x1 * z3 + x3 * z1 + x2 * z3 - x3 * z2);
      c1 = (x1 * y2 - x2 * y1 - x1 * y3 + x3 * y1 + x2 * y3 - x3 * y2);
      d1 = -(x1 * y2 * z3 - x1 * y3 * z2 - x2 * y1 * z3 + x2 * y3 * z1 + x3 * y1 * z2 - x3 * y2 * z1);

      a2 = 2 * (x2 - x1);
      b2 = 2 * (y2 - y1);
      c2 = 2 * (z2 - z1);
      d2 = x1 * x1 + y1 * y1 + z1 * z1 - x2 * x2 - y2 * y2 - z2 * z2;

      a3 = 2 * (x3 - x1);
      b3 = 2 * (y3 - y1);
      c3 = 2 * (z3 - z1);
      d3 = x1 * x1 + y1 * y1 + z1 * z1 - x3 * x3 - y3 * y3 - z3 * z3;

      let x, y, z; // circle center
      x = -(b1 * c2 * d3 - b1 * c3 * d2 - b2 * c1 * d3 + b2 * c3 * d1 + b3 * c1 * d2 - b3 * c2 * d1)
           / (a1 * b2 * c3 - a1 * b3 * c2 - a2 * b1 * c3 + a2 * b3 * c1 + a3 * b1 * c2 - a3 * b2 * c1);
      y = (a1 * c2 * d3 - a1 * c3 * d2 - a2 * c1 * d3 + a2 * c3 * d1 + a3 * c1 * d2 - a3 * c2 * d1)
           / (a1 * b2 * c3 - a1 * b3 * c2 - a2 * b1 * c3 + a2 * b3 * c1 + a3 * b1 * c2 - a3 * b2 * c1);
      z = -(a1 * b2 * d3 - a1 * b3 * d2 - a2 * b1 * d3 + a2 * b3 * d1 + a3 * b1 * d2 - a3 * b2 * d1)
           / (a1 * b2 * c3 - a1 * b3 * c2 - a2 * b1 * c3 + a2 * b3 * c1 + a3 * b1 * c2 - a3 * b2 * c1);

      let r = 0.0;
      r = Math.sqrt((x1 - x) * (x1 - x) + (y1 - y) * (y1 - y) + (z1 - z) * (z1 - z));
      r = Math.sqrt((x2 - x) * (x2 - x) + (y2 - y) * (y2 - y) + (z2 - z) * (z2 - z));
      r = Math.sqrt((x3 - x) * (x3 - x) + (y3 - y) * (y3 - y) + (z3 - z) * (z3 - z));
      const c = new Vector3(x, y, z);
      const p12 = new Vector3(), pc1 = new Vector3(), pc2 = new Vector3(), pc3 = new Vector3(),
           p23 = new Vector3(), p31 = new Vector3(),
           n = new Vector3, u = new Vector3(), v = new Vector3(), dot = new Vector3();
      p12.copy(viaPos).sub(currentPos);
      p23.copy(targetPos).sub(viaPos);
      p31.copy(currentPos).sub(targetPos);
      pc1.copy(currentPos).sub(c).normalize();
      pc2.copy(viaPos).sub(c).normalize();
      pc3.copy(targetPos).sub(c).normalize();
      n.copy(p12).cross(pc2).normalize();
      u.copy(pc1);
      v.copy(u).cross(n);
      const thetam12 = Math.acos(dot.copy(pc1).dot(pc2) / pc1.length() * pc2.length());
      const thetam13 = Math.acos(dot.copy(pc1).dot(pc3) / pc1.length() * pc3.length());
      const thetam23 = Math.acos(dot.copy(pc2).dot(pc3) / pc2.length() * pc3.length());
      const circlePoints = [];
      for (let i = 0; i < 101; i++) {
        const theta = (-2 * Math.PI + thetam13) / 100 * i;
        const x4 = c.x + r * u.x * Math.cos(theta) + r * v.x * Math.sin(theta);
        const y4 = c.y + r * u.y * Math.cos(theta) + r * v.y * Math.sin(theta);
        const z4 = c.z + r * u.z * Math.cos(theta) + r * v.z * Math.sin(theta);
        circlePoints.push(new Vector3(x4, y4, z4));
    }
      return circlePoints;

  }
  private trajectoryPlay(target, currentPosition, duration, robot){
    const curve = new CatmullRomCurve3([
      currentPosition,
      target.position
    ]);
    const points = curve.getPoints(2);
    this.worldService.changeColor(target.mesh, 0xffff00);
    const curveGeometry = new Geometry();
    const linematerial = new LineBasicMaterial({
      color: COLOR.active,
      linewidth: 3
    });

    curveGeometry.vertices = points;
    const line = new Line(curveGeometry, linematerial);
    robot.add(this.line);
    this.worldService.getScene().attach(line);
    this.line.push(line);
    const times: any = Array.from({length: points.length}, (x, i) => x = i);
    const posArr = [];
    points.forEach(p => {
      return posArr.push(p.x, p.y, p.z);
    });
    const values: any = new Float32Array(posArr);
    const posTrack = new KeyframeTrack('.position', times, values);
    const clip = new AnimationClip('default', 2, [posTrack]);
    this.worldService.setMixer(robot.userData.effector);
    const animationAction = this.worldService.getMixer().clipAction(clip);
    animationAction.loop = LoopOnce;
    animationAction.clampWhenFinished = true;
    // animationAction.timeScale = 1;
    return new Promise((resolve, reject) => {
      animationAction.play();
      const mixer = this.worldService.getMixer();
      mixer.addEventListener('finished', () => {
        this.worldService.restoreColor(target.mesh);
        resolve(true);
      });
    });

  }

  public gripperOpen(){

  }

  public async moveJointPoints(pointList: Point[], duration: number, robot: Object3D){
    for (const p of pointList) {
      await this.movePTP(p, duration, robot);
    }
  }

  public async  moveLinerPoints(pointList: Point[], duration: number, robot: Object3D){
    for (const l of this.line){
      this.worldService.getScene().remove(l);
    }
    const currentPosition = robot.userData.effector.position;
    for (let i = 0; i < pointList.length; i++){
      if ( i === 0){
        await this.trajectoryPlay(pointList[i], currentPosition, duration, robot);
      }else{
        await this.trajectoryPlay(pointList[i], pointList[i - 1].position, duration, robot);
      }
    }

  }

  public moveCirclePoints(pointList: Point[], duration: number, robot: Object3D){
    // const currentPosition = robot.userData.effector.position;
    // const points = this.getCircleTrajectory(pointList,currentPosition);
    // this.trajectoryPlay(points,duration,robot);
  }
}
