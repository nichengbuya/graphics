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
import { AnimationMixer, AxesHelper, BoxBufferGeometry,  Clock,  Euler, Intersection, Mesh, MeshBasicMaterial, MeshLambertMaterial, Object3D, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { EventEmitService } from '../event/event-emit.service';
import Kinematics from '../../common/kinematics';
import { environmentUrl } from '../../config';
import Shader from '../../components/shader/shader';
import { CommandService } from '../command/command.service';
import { AddObjectCommand } from '../command/add-object-command';
import { SetPositionCommand } from '../command/set-position-command';
import { SetRotationCommand } from '../command/set-rotation-command';
import { RemoveObjectCommand } from '../command/remove-object-command';
import { AttachCommand } from '../command/attach-command';
import { DetachCommand } from '../command/detach-command';
export interface Device {
  img: string; name: string; url: string; type: string; attach: string;joints?:[],position?:Vector3
}
@Injectable({
  providedIn: 'root'
})
export class WorldService {
  effector: any;
  initialing: boolean;
  devices: Object3D[] = [];
  objects: Object3D[] = [];
  curObj: Object3D;
  controls: OrbitControls;
  transformControls: TransformControls;
  width: any;
  height: any;
  camera: PerspectiveCamera;
  composer: any;
  scene: THREE.Scene;
  axesHelper: AxesHelper;
  dragControls: DragControls;
  renderer: WebGLRenderer;
  container: any;
  outlinePass: any;
  id: number;
  mixer: AnimationMixer;
  clock: Clock;
  arrowHelper: THREE.ArrowHelper;
  editType: 'montion' | 'building';
  constructor(
    private eventEmitService: EventEmitService,
    private commandService: CommandService
  ) {
  }
  // set get value
  setWorld(dom: Shader) {
    this.container = dom;
    this.init();
  }
  getScene(){
    return this.scene;
  }
  getCurObj(){
    return this.curObj;
  }

  setEditType(type: 'montion' | 'building'){
    if ( this.curObj && type === 'montion' && this.curObj.userData.type === 'robot'){
      this.transformControls.attach(this.curObj.userData.effector);
    }else if (this.curObj && type === 'building') {
      this.transformControls.attach(this.curObj);
    }
    this.editType = type;
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
    this.initClock();
    // this.bindRaycasterEvent();
    // this.initEffectorComposer();
    this.animate();
  }
  bindResizeEvent() {
    window.addEventListener('resize', () => {
      this.updateSize();
    }, false);
    document.addEventListener('keydown', this.keyDownEvent, false);
  }
  private keyDownEvent = (event) => {
    if (event.keyCode === 46) {
      this.removeObject(this.curObj);
      this.commandService.execute(new RemoveObjectCommand(this, this.curObj));
    }
    if (event.ctrlKey === true && event.keyCode === 90 && !event.shiftKey) {// Ctrl+Z
      event.returnvalue = false;
      this.commandService.undo();
    }
    if (event.ctrlKey === true && event.shiftKey && event.keyCode === 90) {// Ctrl+Z+Shift
      event.returnvalue = false;
      this.commandService.redo();
    }
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
    this.removeRaycasterEvent();
    this.bindRaycasterEvent();
    // this.composer.setSize(this.width, this.height);

    // this.effectFXAA.uniforms.resolution.value.set( 1 / this.width, 1 / this.height );
    this.render();
  }
  removeRaycasterEvent() {
    const { container } = this;

    container.removeEventListener('click', this.mouseclick);
    container.removeEventListener('move', this.mousemove);
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
  initDragControl(objects: THREE.Object3D[]) {
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
  initClock(){
    this.clock = new Clock();
  }
  checkCollisioin(mesh: { position: { clone: () => any; }; geometry: { vertices: string | any[]; }; matrix: any; }, obstacles: THREE.Object3D[]) {
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
      this.mixer.update(this.clock.getDelta());
    }
    TWEEN.update();
    this.render();

  }
  setMixer(moveObj: THREE.Object3D | THREE.AnimationObjectGroup) {
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
  mouseDown = (event: any) => { };
  mouseUp = (event: any) => { };
  mouseclick = (event: any) => { };
  mousemove = (event: any) => { };
  removeEvent() {
    const { container, scene, objects, id } = this;
    container.removeEventListener('click', this.mouseclick);
    container.removeEventListener('mousemove', this.mousemove);
    document.removeEventListener('keydown', this.keyDownEvent);
    window.removeEventListener('resize', () => { this.updateSize(); }, false);
    this.commandService.clear();
    scene.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        item?.geometry && item.geometry.dispose();
        item.material instanceof THREE.Material ? item?.material?.dispose && item.material.dispose() : item.material.forEach((item: { dispose: () => void; }) => {
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
    let objectPositionOnDown: Vector3;
    let objectRotationOnDown: Euler;
    this.transformControls = new TransformControls(camera, renderer.domElement);
    this.transformControls.setSize(.5);
    this.transformControls.traverse((obj: any) => { // To be detected correctly by OutlinePass.
      obj.isTransformControls = true;
    });
    scene.add(this.transformControls);
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.controls.enabled = !event.value;

    });
    this.transformControls.addEventListener('change', (event) => {
      if (this.editType === 'montion') {
        this.eventEmitService.emitChange.emit();
        // return;
      }

      const res = this.calcArrow();
      if (res) {
        if (res.length < .6) {
          this.changeColor(res.device, 0xffff00);
        } else {
          this.restoreColor(res.device);
        }
      }
    });
    this.transformControls.addEventListener('mouseDown', (event) => {
      this.removeRaycasterEvent();
      if (this.editType === 'montion') { return; }
      this.arrowHelper = new THREE.ArrowHelper(new Vector3(), new Vector3(), length, 0xffff00);
      this.scene.add(this.arrowHelper);
      objectPositionOnDown = this.curObj.position.clone();
      objectRotationOnDown = this.curObj.rotation.clone();
    });
    this.transformControls.addEventListener('mouseUp', (event) => {
      const res = this.calcArrow();
      if (res) {
        if (res.length < .6) {
          this.attach(this.curObj, res.device);
          this.commandService.execute(new AttachCommand(this, objectPositionOnDown, this.curObj, res.device));
          this.restoreColor(res.device);
          this.curObj = null;
        } else {
          if (this.curObj.parent.type !== 'Scene'){
            this.commandService.execute(new DetachCommand(this, this.curObj.position, this.curObj, res.device));
          }

          this.detach(this.curObj);
        }
      }
      const object = this.transformControls.object;

      if (object !== undefined && object.parent.type === 'Scene') {

        switch (this.transformControls.getMode()) {

          case 'translate':

            if (!objectPositionOnDown.equals(object.position)) {

              this.commandService.execute(new SetPositionCommand(object, object.position, objectPositionOnDown));

            }

            break;

          case 'rotate':

            if (!objectRotationOnDown.equals(object.rotation)) {

              this.commandService.execute(new SetRotationCommand(object, object.rotation, objectRotationOnDown));

            }

            break;

          // case 'scale':

          //   if (!objectScaleOnDown.equals(object.scale)) {

          //     editor.execute(new SetScaleCommand(editor, object, object.scale, objectScaleOnDown));

          //   }

          //   break;
        }
      }
      setTimeout(() => {
        this.bindRaycasterEvent();
        this.scene.remove(this.arrowHelper);
        this.arrowHelper = null;
        this.eventEmitService.sceneChange.emit(this.scene);

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
    this.eventEmitService.sceneChange.emit(this.scene);
    objects.push(mesh);
  }

  initRobot(device: Device): Promise<URDFLink> {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    loader.packages = `${environmentUrl}/static/robot`;
    loader.fetchOptions = { mode: 'cors', credentials: 'same-origin' };
    const url = `${environmentUrl}/${device.url}`;

    return new Promise((resolve, reject) => {
      loader.load(url, (robot: URDFLink) => {
        robot.userData.type = device.type;
        robot.userData.attach = device.attach;
        robot.userData.kinematics = new Kinematics(device.name);
        robot.userData.joints = Object.values(robot.joints).filter((joint: any) => joint.jointType === 'revolute');
        robot.position.copy(device.position)
        const effector = new Mesh(new BoxBufferGeometry(.01, .01, .01), new MeshBasicMaterial({ transparent: true }));
        robot.add(effector);
        robot.userData.effector = effector;
        robot.userData.fk = () => {
          const theta = robot.userData.joints.map((joint: { angle: any; }) => joint.angle);
          const result = robot.userData.kinematics.forward(theta);
          effector.position.set(result[0], result[1], result[2]);
          effector.rotation.set(result[3], result[4], result[5]);
        };
        robot.userData.ik = () => {
          effector.updateMatrixWorld();
          const matrix = effector.matrix.elements;
          const cartPos = [
            matrix[0], matrix[4], matrix[8], matrix[12],
            matrix[1], matrix[5], matrix[9], matrix[13],
            matrix[2], matrix[6], matrix[10], matrix[14],
          ];
          const theta = robot.userData.kinematics.inverse(cartPos)[3];
          // theta.forEach((value: number, index: string | number) => {
          //   if (Math.abs(value - robot.userData.joints[index]) > Math.PI * 2 - Math.PI / 180 * 10) {
          //     value > 0 ? value = value - Math.PI * 2 : value = value + Math.PI * 2;
          //   }
          // });
          if (theta.find((item: number) => isNaN(item)) === undefined) {
            if (theta.every((item: number) => item === 0)) {
              // robot.userData.fk();
            } else {
              theta.forEach((item: any, index: string | number) => {
                robot.userData.joints[index].setAngle(item);
              });
            }
          }
        };
        this.scene.add(robot);
        manager.onLoad = () => {
          resolve(robot);
          if (robot.userData.type === 'robot') {
            robot.userData.joints.forEach((joint: any,index: number) => {
              joint.setAngle(device.joints[index])
            })
          }
          robot.userData.fk();
        };
      }, () => { }, (error: any) => {
        reject(error);
      });
    });

  }
  initPoint(effector):Mesh {
    let vertexShader = [
        'varying vec3	vVertexWorldPosition;',
        'varying vec3	vVertexNormal;',
        'varying vec4	vFragColor;',
        'void main(){',
        '	vVertexNormal	= normalize(normalMatrix * normal);',
        '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',
        '	// set gl_Position',
        '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
    ].join('\n');
    let fragmentShader2 = [
        'uniform vec3	glowColor;',
        'uniform float	coeficient;',
        'uniform float	power;',
        'varying vec3	vVertexNormal;',
        'varying vec3	vVertexWorldPosition;',
        'varying vec4	vFragColor;',
        'void main(){',
        '	vec3 worldVertexToCamera= cameraPosition - vVertexWorldPosition;',
        '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldVertexToCamera, 0.0)).xyz;',
        '	viewCameraToVertex	= normalize(viewCameraToVertex);',
        '	float intensity		= coeficient + dot(vVertexNormal, viewCameraToVertex);',
        '	if(intensity > 0.8){ intensity = 0.0;}',
        '	gl_FragColor		= vec4(glowColor, intensity);',
        '}'
    ].join('\n');

    let sphere = new THREE.SphereBufferGeometry(0.04, 32, 32);
    let material = new THREE.ShaderMaterial({
        uniforms: {
            coeficient: {
                value: 0,
            },
            power: {
                value: 2
            },
            glowColor: {
                value: new THREE.Color(0x50BED7)
            }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader2,
        blending: THREE.NormalBlending,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });
    let point = new THREE.Mesh(sphere, material);
    let haloGeometry = new THREE.SphereBufferGeometry(0.02, 32, 32);
    let haloMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x50BED7),
        depthWrite: false,
        depthTest: false,
        transparent: true
    });
    let halo = new THREE.Mesh(haloGeometry, haloMaterial);
    point.userData.type = halo.userData.type = 'point';
    point.add(halo);
    point.matrixAutoUpdate = true;
    point.traverse((child: any) => {
        child.isTransformControls = true;
    });
    point.position.copy(effector.position);
    point.quaternion.copy(effector.quaternion);
    return point;
}
  initGeometry(device){
    const geometry = new BoxBufferGeometry(1,1,1);
    const material = new MeshLambertMaterial({color:0xffff00});
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(device.position)
    mesh.userData = {...device};
    return new Promise((resolve, reject) => {
       resolve(mesh);
    })
    
  }

  async initObject(device){
    let res;
    switch(device.type){
      case 'robot':{
        res = await this.initRobot(device)
        break;
      }
      case 'gripper':{
        res = await this.initRobot(device)
        break;
      }
      case 'geometry':{
        res = await this.initGeometry(device)
        break;
      }
    }
    return res;
  }
  screenPointToThreeCoords(x, y, domContainer, targetZ) {
    const {camera} = this;
    const vec = new THREE.Vector3(); // create once and reuse
    const pos = new THREE.Vector3(); // create once and reuse
  
    vec.set(
        ( x / domContainer.clientWidth ) * 2 - 1,
        - ( y / domContainer.clientHeight ) * 2 + 1,
        0.5 );
  
    vec.unproject( camera );
  
    vec.sub( camera.position ).normalize();
  
    var distance = (targetZ - camera.position.z) / vec.z;
  
    pos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
    return pos;
  }
  /*
    edit
  */
  addObject(model: THREE.Object3D) {
    this.scene.add(model);
    this.devices.push(model);
    this.eventEmitService.sceneChange.emit(this.scene);
  }
  removeObject(curObj) {
    // const { curObj } = this;
    if (curObj) {
      this.transformControls.detach();
      this.scene.remove(curObj);
      const index = this.devices.indexOf(curObj);
      this.devices.splice(index, 1);
      this.eventEmitService.sceneChange.emit(this.scene);
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
        this.changeColor(this.curObj, 0x50bed7);
        this.transformControls.attach(this.curObj);
      }
    } else {
      this.restoreColor(this.curObj);
      this.transformControls.detach();
      this.curObj = null;
    }
    return this.curObj;
  }

  /**
   * child attach to parent , child will be a part of parent
   *
   * @param {Object3D} child
   * @param {Object3D} parent
   * @memberof WorldService
   */
  attach(child: Object3D, parent: Object3D): void {
    parent.add(child);
    child.position.copy(parent.userData.effector.position);
    child.quaternion.copy(parent.userData.effector.quaternion);
    this.transformControls.detach();
    // this.curObj = null;
  }
  /**
   * detach child from parent
   *
   * @param {Object3D} child
   * @memberof WorldService
   */
  detach(child: Object3D): void {
    this.scene.attach(child);
    this.scene.add(child);
    this.changeColor(child, 0x50bed7);
  }
  /**
   * change a device color
   *
   * @param {Object3D} model
   * @param {number} color
   * @return {void}
   * @memberof WorldService
   */
  changeColor(model: Object3D, color: number): void {
    if (!this.curObj) {
      return;
    }
    model.traverse((child: any) => {
      if (child.currentColor !== undefined) { return; }
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
            m.color.set(color);
          }
        } else {
          child.material.color.setHex(color);
        }
      }
    });
  }
  restoreColor(model: THREE.Object3D) {
    if (!this.curObj) {
      return;
    }
    model.traverse((child: any) => {
      if (child.isMesh) {
        if (child.material instanceof Array) {
          for (const m of child.material) {
            m.color.set(child.currentColor);
          }
        } else {
          child.material.color.set(child.currentColor);
        }
      }
    });
  }
  calcArrow() {
    if (!this.curObj || this.editType === 'montion' || this.curObj.userData.type === 'geometry') {
      return;
    }
    const position = new Vector3();
    this.curObj.getWorldPosition(position);
    const distance = this.devices.filter(d => d.userData.type === this.curObj.userData.attach).map(d => {
      const effector = new Vector3();
      d.userData.effector.getWorldPosition(effector);
      return { length: position.distanceTo(effector), end: effector, device: d };
    }).sort((a, b) => a.length - b.length);
    if (distance.length === 0) {
      return null;
    }
    const dir = new THREE.Vector3();
    dir.copy(distance[0].end).sub(position);
    dir.normalize();
    const length = distance[0].length;
    const hex = 0xffff00;
    if (this.arrowHelper) {
      this.arrowHelper.setDirection(dir);
      this.arrowHelper.setLength(length);

      this.arrowHelper.position.copy(position);
    }
    return distance[0];
  }
}
