import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import OutlinePassCopy from './outlinePass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass';
import * as dat from 'three/examples/jsm/libs/dat.gui.module.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { Object3D } from 'three';
const scale = 50;
interface StageProps {
    container: HTMLElement;
    listeners: {
        [propName: string]: (data?: any) => void;
    };
}
const clock = new THREE.Clock();
// THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
class World {
    intersects: THREE.Intersection[];
    objects: THREE.Object3D[];
    raycaster: THREE.Raycaster;
    listeners: { [propName: string]: (data?: any) => void; };
    id: number;
    container: any;
    axesHelper: boolean;
    mixer: any;
    width: any;
    height: any;
    scene: THREE.Scene;
    light: any;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    transformControls: TransformControls;
    renderer: THREE.WebGLRenderer;
    dragControls: any;
    composer!: EffectComposer;
    // outlinePass: OutlinePassCopy;
    effectFXAA: ShaderPass;
    outlinePass: any;

    constructor(
        options: StageProps
    ) {
        this.container = options.container;
        // this.axesHelper = axesHelper;
        this.width = options.container.offsetWidth;
        this.height = options.container.offsetHeight;
        this.listeners = options.listeners;
        this.objects = [];
        this.init();
    }


    init() {
        this.createScene();
        this.createCamera();
        this.createLight();
        this.createGrid();
        this.createRender();
        // this.initGui();
        this.createControl();
        this.bindResizeEvent();
        this.bindRaycasterEvent();
        this.initTransformControl();
        this.initEffectorComposer();
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
        renderer.setSize( this.width, this.height );
        this.composer.setSize( this.width, this.height );

        this.effectFXAA.uniforms.resolution.value.set( 1 / this.width, 1 / this.height );
        this.render();
    }
    bindRaycasterEvent() {
        const { container } = this;
        const isMobile = 'ontouchstart' in document;
        // const mousedownName = isMobile ? 'touchstart' : 'mousedown'
        // const mouseupName = isMobile ? 'touchend' : 'mouseup'
        const canvas = this.renderer.domElement;
        const raycaster = this.raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const rect = canvas.getBoundingClientRect();

        this.mousemove = (event) => {
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.objects, true);
            this.listeners.move(intersects);
        };
        this.mouseclick  = (event) => {
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.objects, true);
            this.listeners.click(intersects);
        };
        this.mouseDown = (event: MouseEvent) => {
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.objects, true);
            if (event.button === 2 ) {
                this.listeners.rightClick(intersects);
            }
        };
        container.addEventListener('mousemove', this.mousemove, false);
        container.addEventListener('click', this.mouseclick, false);
        container.addEventListener('mousedown', this.mouseDown, false);
    }
    mouseDown = (event) => {};
    mouseUp = (event) => {};
    mouseclick = (event) => {};
    mousemove = (event) => {};
    removeRaycasterEvent() {
        const { container } = this;

        container.removeEventListener('click', this.mouseclick);
    }
    removeEvent() {
        const { container } = this;
        container.removeEventListener('click', this.mouseclick);
        container.removeEventListener('mousemove', this.mousemove);
        window.removeEventListener('resize', () => { this.updateSize(); }, false);
        this.scene.traverse((item) => {
            if (item instanceof THREE.Mesh) {
                item?.geometry && item.geometry.dispose();
                item.material instanceof THREE.Material ? item?.material?.dispose && item.material.dispose() : item.material.forEach(item => {
                    item.dispose();
                });

            }
        });
        this.objects = [];
        while (this.scene.children.length) {
            this.scene.remove(this.scene.children[0]);
        }
        cancelAnimationFrame(this.id);
    }
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xcccccc);
        if (this.axesHelper) {
            this.scene.add(new THREE.AxesHelper(10e3));
        }
    }
    // createPlane() {
    //     const planeGeometry = new THREE.PlaneBufferGeometry(10e2, 10e2, 1, 1);
    //     const planeMeterial = new THREE.ShadowMaterial();

    //     const plane = new THREE.Mesh(planeGeometry, planeMeterial);
    //     // plane.rotation.set(Math.PI / 2, 0, 0);

    //     // 接收阴影
    //     plane.receiveShadow = true;
    //     this.scene.add(plane);

    // }
    createGrid() {
        const gridHelper = new THREE.GridHelper(scale * 10, 20);
        // gridHelper.rotation.x = .5 * Math.PI;
        // this.scene.add(gridHelper);
    }
    createCamera() {
        this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
        this.camera.position.set( 1000, 50, 1500 );
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
        this.camera.updateProjectionMatrix();
    }
    createLight() {

        this.scene.add( new THREE.AmbientLight( 0x666666 ) );

        const light = new THREE.DirectionalLight( 0xdfebff, 1 );
        light.position.set( 50, 200, 100 );
        light.position.multiplyScalar( 1.3 );

        light.castShadow = true;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        const d = 300;

        light.shadow.camera.left = - d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = - d;

        light.shadow.camera.far = 1000;

        this.scene.add( light );
    }
    createControl() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // this.controls = new TrackballControls( this.camera, this.renderer.domElement );
        this.controls.screenSpacePanning = true;
        this.controls.minDistance = 0;
        this.controls.maxDistance = 40000;
        this.controls.target.set(0, 0, 0);

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
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.transformControls.traverse((obj: any) => { // To be detected correctly by OutlinePass.
            obj.isTransformControls = true;
          });
        this.scene.add(this.transformControls);
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
            exportScene:  () => {
                const sceneJson = JSON.stringify(this.scene.toJSON());
                localStorage.setItem('scene', sceneJson);
            },
            clearScene:  () => {
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
    createRender() {
        const { container } = this;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
    }
    initEffectorComposer() {
        const {renderer, scene, camera} = this;
        const composer = this.composer = new EffectComposer( renderer );

        const renderPass = new RenderPass( scene, camera );
        composer.addPass( renderPass );

        const taaRenderPass = new TAARenderPass( scene, camera , 0, 0);
        taaRenderPass.unbiased = false;
        taaRenderPass.sampleLevel = 5;
        composer.addPass( taaRenderPass );
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
            this.mixer.update(clock.getDelta());
        }
        TWEEN.update();
        this.render();

    }
    moveCamera(fromData, toData, duration) {

    }
    addObjTo() {

    }
    setMixer(moveObj) {
        this.mixer = new THREE.AnimationMixer(moveObj);
    }
    getMixer() {
        return this.mixer;
    }
    add(...args) {
        return this.scene.add(...args);
    }

    remove(...args) {
        return this.scene.remove(...args);
    }
}
export default World;
