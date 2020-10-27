import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GridHelper, Mesh, BoxBufferGeometry, MeshBasicMaterial } from 'three';
import Kinematics from '../components/common/kinematics';
import World from '../components/common/world';
import URDFLoader from 'urdf-loader';
import URDFLink from 'urdf-loader';
import { environmentUrl } from '../config';
interface OriginSize {
  width: number;
  height: number;
}
@Injectable({
  providedIn: 'root'
})
export class WorldService {
  world: World;
  effector: any;
  constructor() { }
  setWorld(world) {
    this.world = world;
  }
  getWorld(dom) {
    return this.world = new World({
      container: dom,
      listeners: {
        move() {

        },
        click() {

        }
      }
    });
  }
  initPlane() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    this.world.camera.add(light);
    const helper = new THREE.GridHelper( 20, 20 , 0x111111, 0x111111 );
    helper.rotateX(Math.PI / 2);
    helper.translateZ(.02);
    this.world.add( helper );
    const planeGemo = new THREE.PlaneBufferGeometry(20, 20);
    const texture = new THREE.TextureLoader().load('assets/texture/plane.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2( 20, 20);
    const materail = new THREE.MeshBasicMaterial({ map: texture , side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(planeGemo, materail);
    this.world.add(mesh);
  }
  initRobot(url): Promise<URDFLink> {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = `${environmentUrl}/static/robot`;
    loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
    url = `${environmentUrl}/${url}`;
    return new Promise((resolve, reject) => {
      loader.load( url, (robot: URDFLink) => {
        robot.userData.kinematics = new Kinematics(robot);
        robot.userData.joints = Object.values(robot.joints).filter((joint: any) => joint.jointType === 'revolute');
        robot.userData.fk = () => {
          const theta = robot.userData.joints.map(joint => joint.angle);
          const result = robot.userData.kinematics.forward(theta);
          this.effector.position.set(result[0], result[1], result[2]);
          this.effector.rotation.set(result[3], result[4], result[5]);
        };
        robot.userData.ik = () => {
          if (!this.effector) {
            return;
          }
          this.effector.updateMatrixWorld();
          const matrix = this.effector.matrix.elements;
          const cartPos = [
            matrix[0], matrix[4], matrix[8], matrix[12],
            matrix[1], matrix[5], matrix[9], matrix[13],
            matrix[2], matrix[6], matrix[10], matrix[14],
          ];
          const theta = robot.userData.kinematics.inverse(cartPos)[2];
          theta.forEach((value, index) => {
            if (Math.abs(value - robot.userData.joints[index]) > Math.PI * 2 - Math.PI / 180 * 10) {
              value > 0 ? value = value - Math.PI * 2 : value = value + Math.PI * 2;
            }
          });
          if (theta.find(item => isNaN(item)) === undefined) {
            if (theta.every(item => item === 0)) {
            } else {
              // this.changeRobotColor(color.default);
              theta.forEach((item, index) => {
                robot.userData.joints[index].setAngle(item);
              });
            }
          }
        };
        this.world.add(robot);
        manager.onLoad = () => {
          resolve(robot);
        };
      }, () => { }, (error) => {
        reject(error);
      });
    });

  }
  initEndEffector() {
    this.effector = new Mesh(new BoxBufferGeometry(.01, .01, .01), new MeshBasicMaterial({ transparent: true }));
    this.world.add(this.effector);
    this.world.transformControls.attach(this.effector);
  }
  add(model){
    this.world.add(model)
  }
}
