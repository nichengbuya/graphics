import { Injectable } from '@angular/core';
import URDFLink from 'urdf-loader';
import URDFLoader from 'urdf-loader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
// import OutlinePassCopy from './outlinePass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { BoxBufferGeometry, Intersection, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { EventEmitService } from './event-emit.service';
import Kinematics from '../components/common/kinematics';
import { environmentUrl } from '../config';
@Injectable({
  providedIn: 'root'
})
export class WorldService {
  effector: any;
  initialing: boolean;
  devices: Object3D[] = [];
  objects: Object3D[] = [];
  curObj;
  controls: OrbitControls;
  transformControls: TransformControls;
  width: any;
  height: any;
  camera: any;
  composer: any;
  scene: THREE.Scene;
  axesHelper: any;
  dragControls: DragControls;
  renderer: any;
  container: any;
  outlinePass: any;
  id: number;
  mixer: any;
  constructor(
    private eventEmitService: EventEmitService
  ) {
  }
  setWorld(dom) {
    this.container = dom;
    this.init();
    // return this;
  }
  init() {
    this.initScene();
    this.initCamera();
    this.initLight();
    this.initRender();
    // this.initGui();
    this.bindResizeEvent();
    this.updateSize();
    this.initOrbitControl();
    this.initTransformControl();
    this.bindRaycasterEvent();
    // this.initEffectorComposer();
    this.animate();
  }
  bindResizeEvent() {
    window.addEventListener('resize', () => {
      this.updateSize();
    }, false);
  }
  updateSize() {
    const { container, renderer } = this;
    const { offsetWidth, offsetHeight } = container;

    this.width = offsetWidth;
    this.height = offsetHeight;
    this.camera.aspect = offsetWidth / offsetHeight;
    this.camera.updateProjectionMatrix();
    renderer.setSize(offsetWidth, offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.width, this.height);
    // this.composer.setSize(this.width, this.height);

    // this.effectFXAA.uniforms.resolution.value.set( 1 / this.width, 1 / this.height );
    this.render();
  }
  removeRaycasterEvent() {
      const { container } = this;

      container.removeEventListener('click', this.mouseclick);
  }
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcccccc);
    if (this.axesHelper) {
      this.scene.add(new THREE.AxesHelper(10e3));
    }
  }
  initCamera() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(0, 3, 3);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
    this.camera.updateProjectionMatrix();
  }
  initLight() {

    this.scene.add(new THREE.AmbientLight(0xeeeeee));

  }
  initDragControl(objects) {
    this.dragControls = new DragControls(objects, this.camera, this.renderer.domElement);
    const mousemove = () => {
      // this.emitService.dragEmit.emit(true);
    };
    this.dragControls.addEventListener('dragstart', () => {
      this.controls.enabled = false;
      this.dragControls.addEventListener('drag', mousemove);
    });

    this.dragControls.addEventListener('dragend', () => {

      this.controls.enabled = true;
      this.dragControls.removeEventListener('drag', mousemove);

    });
  }
  initGui() {
    // 声明一个保存需求修改的相关数据的对象
    const gui = {
      exportScene: () => {
        const sceneJson = JSON.stringify(this.scene.toJSON());
        localStorage.setItem('scene', sceneJson);
      },
      clearScene: () => {
        this.scene = new THREE.Scene();
      },
      importScene: () => {
        const json = localStorage.getItem('scene');

        if (json) {
          const loadedGeometry = JSON.parse(json);
          const loader = new THREE.ObjectLoader();

          this.scene = loader.parse(loadedGeometry);
        }
      }
    };
    const datGui = new dat.GUI();
    // datGui.document.style = 'z-index:15';
    datGui.add(gui, 'exportScene');
    datGui.add(gui, 'clearScene');
    datGui.add(gui, 'importScene');
  }

  checkCollisioin(mesh, obstacles) {
    if (mesh === undefined || obstacles === undefined) {
      return;
    } else {
      const originPoint = mesh.position.clone();
      for (let vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++) {
        const localVertex = mesh.geometry.vertices[vertexIndex].clone();
        const globalVertex = localVertex.applyMatrix4(mesh.matrix);
        const directionVector = globalVertex.sub(originPoint);

        const ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());
        const collisionResults = ray.intersectObjects(obstacles);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
          console.log('碰到了');
        }
      }
    }
  }
  initRender() {
    const { container } = this;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.domElement.style.outline = 'none';
    this.container.appendChild(this.renderer.domElement);
  }
  initEffectorComposer() {
    const { renderer, scene, camera } = this;
    const composer = this.composer = new EffectComposer(renderer);

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const taaRenderPass = new TAARenderPass(scene, camera, 0, 0);
    taaRenderPass.unbiased = false;
    taaRenderPass.sampleLevel = 5;
    composer.addPass(taaRenderPass);
    // this.outlinePass = new OutlinePassCopy( new THREE.Vector2( this.width, this.height ), scene, camera );
    // this.outlinePass.visibleEdgeColor.set( '#50BED7' );
    // composer.addPass( this.outlinePass );

    // this.effectFXAA = new ShaderPass( FXAAShader );
    // this.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / this.width, 1 / this.height );
    // composer.addPass( this.effectFXAA );

  }
  renderOutlineObject(selectedObjects: Array<Object3D>) {
    this.outlinePass.selectedObjects = selectedObjects;
  }


  render() {
    const { scene, camera } = this;
    this.renderer.render(scene, camera);
    // this.composer.render();
  }
  animate() {
    this.id = requestAnimationFrame(this.animate.bind(this));

    // required if controls.enableDamping or controls.autoRotate are set to true
    this.controls.update();
    if (this.mixer) {
      // this.mixer.update(clock.getDelta());
    }
    TWEEN.update();
    this.render();

  }
  setMixer(moveObj) {
    this.mixer = new THREE.AnimationMixer(moveObj);
  }
  getMixer() {
    return this.mixer;
  }
  bindRaycasterEvent() {
    const { container, renderer, camera, objects } = this;
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
      const intersects = raycaster.intersectObjects(this.devices, true);
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
    const { container, scene, objects, id } = this;
    container.removeEventListener('click', this.mouseclick);
    container.removeEventListener('mousemove', this.mousemove);
    window.removeEventListener('resize', () => { this.updateSize(); }, false);
    scene.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        item?.geometry && item.geometry.dispose();
        item.material instanceof THREE.Material ? item?.material?.dispose && item.material.dispose() : item.material.forEach(item => {
          item.dispose();
        });

      }
    });
    objects.length = 0;
    while (scene.children.length) {
      scene.remove(scene.children[0]);
    }
    cancelAnimationFrame(id);
  }
  initOrbitControl() {
    const { scene, camera, renderer } = this;
    this.controls = new OrbitControls(camera, renderer.domElement);

    // this.controls = new TrackballControls( this.camera, this.renderer.domElement );
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 0;
    this.controls.maxDistance = 40000;
    this.controls.target.set(0, 0, 0);
    this.controls.minPolarAngle = 0;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.enableKeys = false;
    const mousemove = () => {
      // this.emitService.dragEmit.emit(true);
    };
    const mousedown = () => {
      this.controls.domElement.addEventListener('mousemove', mousemove);
    };
    const mouseup = () => {
      this.controls.domElement.removeEventListener('mousemove', mousemove);
    };
    this.controls.domElement.addEventListener('mousedown', mousedown);
    this.controls.domElement.addEventListener('wheel', mousemove);
    this.controls.domElement.addEventListener('mouseup', mouseup);

    this.controls.update();
  }
  initTransformControl() {
    const { scene, camera, renderer } = this;
    this.transformControls = new TransformControls(camera, renderer.domElement);
    this.transformControls.traverse((obj: any) => { // To be detected correctly by OutlinePass.
      obj.isTransformControls = true;
    });
    scene.add(this.transformControls);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;

    });
    this.transformControls.addEventListener('mouseDown', (event) => {

      this.removeRaycasterEvent();
    });
    this.transformControls.addEventListener('mouseUp', (event) => {

      setTimeout(() => {
        this.bindRaycasterEvent();
      }, 20);

    });
  }
  initPlane() {
    const { scene, camera, objects } = this;
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    camera.add(light);
    const planeGemo = new THREE.PlaneBufferGeometry(10, 10);
    const texture = new THREE.TextureLoader().load('assets/texture/plane.jpeg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(10, 10);
    const materail = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGemo, materail);
    scene.add(mesh);
    objects.push(mesh);
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
        this.scene.add(robot);
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
    this.scene.add(this.effector);
    this.transformControls.attach(this.effector);
  }
  /*
    edit
  */
  add(model) {
    this.scene.add(model);
    this.devices.push(model);
  }
  remove() {
    const {curObj} = this;
    if (curObj) {
      this.transformControls.detach();
      this.scene.remove(curObj);
      const index = this.devices.indexOf(curObj);
      this.devices.splice(index, 1);
    }
  }
  select(e: Intersection[]) {
    if (e.length) {
      let mesh = e[0].object;
      while (!this.devices.includes(mesh)) {
        mesh = mesh.parent;
      }
      if (this.curObj !== mesh) {
        if (this.curObj) {
          this.restoreColor(this.curObj);
        }
        this.curObj = mesh;
        this.changeColor(this.curObj);
        this.transformControls.attach(this.curObj);
      }
    } else {
      this.restoreColor(this.curObj);
      this.transformControls.detach();
      this.curObj = null;
    }
    return this.curObj;
  }
  changeColor(model: Object3D) {
    if (!this.curObj) {
      return;
    }
    model.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material instanceof Array) {
          for (const m of child.material) {
            child.currentColor = m.color.getHex();
          }
        } else {
          child.currentColor = child.material.color.getHex();
        }
      }
    });
    model.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material instanceof Array) {
          for (const m of child.material) {
            m.color.set(0x50bed7);
          }
        } else {
          child.material.color.setHex(0x50bed7);
        }
      }
    });
  }
  restoreColor(model) {
    if (!this.curObj) {
      return;
    }
    model.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material instanceof Array) {
          for (const m of child.material) {
            m.color.set( child.currentColor);
          }
        } else {
          child.material.color.set(child.currentColor);
        }
      }
    });
  }
}
