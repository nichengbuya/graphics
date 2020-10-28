import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GridHelper, Mesh, BoxBufferGeometry, MeshBasicMaterial } from 'three';
import Kinematics from '../components/common/kinematics';
import World from '../components/common/world';
import URDFLoader from 'urdf-loader';
import URDFLink from 'urdf-loader';
import { environmentUrl } from '../config';
import { EventEmitService } from './event-emit.service';
import { Subscription } from 'rxjs';
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
  initialing: boolean;
  subs: Subscription[] = [];
  constructor(
    private eventEmitService: EventEmitService
  ) {
  }
  setWorld(dom) {
    this.world = new World({
      container: dom
    });
    return this.world;
  }
  bindRaycasterEvent() {
    const { container, renderer, camera, objects } = this.world;
    const isMobile = 'ontouchstart' in document;
    // const mousedownName = isMobile ? 'touchstart' : 'mousedown'
    // const mouseupName = isMobile ? 'touchend' : 'mouseup'
    const canvas = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const rect = canvas.getBoundingClientRect();
    this.mousemove = (event) => {
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, true);
      this.eventEmitService.emitMove.emit(intersects);
    };
    this.mouseclick = (event) => {
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, true);
      this.eventEmitService.emitClick.emit(intersects);
      // this.listeners.click(intersects);
    };
    this.mouseDown = (event: MouseEvent) => {
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, true);
      if (event.button === 2) {
        // this.listeners.rightClick(intersects);
      }
    };
    container.addEventListener('mousemove', this.mousemove, false);
    container.addEventListener('click', this.mouseclick, false);
    container.addEventListener('mousedown', this.mouseDown, false);
  }
  mouseDown = (event) => { };
  mouseUp = (event) => { };
  mouseclick = (event) => { };
  mousemove = (event) => { };
  removeEvent() {
    const { container, scene, objects, id } = this.world;
    container.removeEventListener('click', this.mouseclick);
    container.removeEventListener('mousemove', this.mousemove);
    window.removeEventListener('resize', () => { this.world.updateSize(); }, false);
    scene.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        item?.geometry && item.geometry.dispose();
        item.material instanceof THREE.Material ? item?.material?.dispose && item.material.dispose() : item.material.forEach(item => {
          item.dispose();
        });

      }
    });
    objects.length = 0;
    this.subs.forEach(s => s.unsubscribe());
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }
    cancelAnimationFrame(id);
  }
  initPlane() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    this.world.camera.add(light);
    const planeGemo = new THREE.PlaneBufferGeometry(10, 10);
    const texture = new THREE.TextureLoader().load('assets/texture/plane.jpeg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(10, 10);
    const materail = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGemo, materail);
    this.add(mesh);
    this.world.objects.push(mesh);
  }
  initRobot(url): Promise<URDFLink> {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = `${environmentUrl}/static/robot`;
    loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
    url = `${environmentUrl}/${url}`;
    return new Promise((resolve, reject) => {
      loader.load(url, (robot: URDFLink) => {
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
  add(model) {
    this.world.add(model);
    // this.world.objects.push(model);
  }
}
