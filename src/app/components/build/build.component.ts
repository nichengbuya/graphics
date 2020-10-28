import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { zip } from 'rxjs';
import { MaterialsService } from 'src/app/service/materials.service';
import { TexturesService } from 'src/app/service/textures.service';
import { ToolService } from 'src/app/service/tool.service';
import { WorldService } from 'src/app/service/world.service';
import { environment } from 'src/environments/environment';
import * as THREE from 'three';
import { BufferGeometry, Color, DoubleSide, Geometry, Group, Material, Mesh, Object3D, PointLight, RepeatWrapping,
        ShaderMaterial, SpotLight, Vector3 } from 'three';
import { LoadBarComponent } from '../load-bar/load-bar.component';
import Build from './build';

@Component({
  selector: 'app-build',
  templateUrl: './build.component.html',
  styleUrls: ['./build.component.scss']
})
export class BuildComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('build') div: ElementRef;
  @ViewChild('load') load: LoadBarComponent;
  public world: Build;
  public ModelList = [
    { url: 'v2.glb' },
  ];
  focusTargetPos: Vector3;
  focusCameraPos: Vector3;

  buildingCenter: Vector3;
  parkingCenter: Vector3;

  isFocusOnBuilding: boolean;
  isViewMode: boolean;
  viewedFloorIdx: number;

  afterLoadedMethod = null;

  isModelLoaded = false;


  private insideBuildingMesh: Mesh;
  private outsideBuildingMesh: Mesh;
  private othersMesh: Mesh;
  wholeViewMap: Map<string, { camera: THREE.Vector3; target: THREE.Vector3; }>;
  constructor(
    private materialsService: MaterialsService,
    private texturesService: TexturesService,
    private toolService: ToolService,
    private worldService: WorldService
  ) { }

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0);
    this.focusTargetPos = new Vector3(2.2, 0, -3);
    this.focusCameraPos = new Vector3(2.96, .31, -3.76);

    this.wholeViewMap = new Map([
        ['hoverView', {
            camera: new Vector3(3.01, 4.5, -1.65),
            target: new Vector3(3, 0, -1.63)
        }],
        ['sideView', {
            camera: new Vector3(2.2, .16, -4),
            target: new Vector3(2.29, .14, -2.95)
        }],
        ['45View', {
            camera: new Vector3(4, 3.6, -4.6),
            target: new Vector3(3, 0, -1.63)
        }],
    ]);

    this.buildingCenter = new Vector3();
    this.isViewMode = false;


    this.outsideBuildingMesh = new Mesh(new Geometry(), this.materialsService.outsideBuildingMat);
    this.outsideBuildingMesh.castShadow = true;
    this.insideBuildingMesh = new Mesh(new Geometry(), this.materialsService.insideBuildingMat);
    this.insideBuildingMesh.castShadow = true;
    this.othersMesh = new Mesh(new Geometry(), this.materialsService.baseMat);
    // this.othersMesh.castShadow = true;
    this.othersMesh.receiveShadow = true;

  }
  ngAfterViewInit() {
    this.init();
  }
  ngOnDestroy() {
    this.worldService.removeEvent();
  }
  async init() {
    // this.world = new Build({
    //   container: this.div.nativeElement,
    //   listeners: {
    //     click: () => { },
    //     move: () => { }
    //   }
    // });
    const list = this.ModelList.map(item => this.world.addModel(item.url));
    const models = await Promise.all(list);
    models.forEach((item: Group) => {
      this.modelLoaded(item);
    });
  }
  private modelLoaded(model: Group) {
    const meshResolveMap = new Map([
      [/label/i, this.resolveLabelMesh.bind(this)],
      [/base/i, this.resolveBaseMesh.bind(this)],
      [/ground/i, this.resolveGroundMesh.bind(this)],
      [/reflect/i, this.resolveReflectMesh.bind(this)],
      [/hightlight-decorator-nodes/gi, this.resolveDecoratorMesh.bind(this)],
      [/building/i, this.resolveBuildingMesh.bind(this)],
      [/color-spots/i, this.resolveColorSpotsMesh.bind(this)],
      [/road-light/i, this.resolveRoadLightMesh.bind(this)],
      [/light-border/i, this.resolveLightBorderMesh.bind(this)],
      [/parking-area/i, this.resolveParkingAreaMesh.bind(this)],
      [/door/i, this.resolveDoorMesh.bind(this)],
      [/area-indicator/i, this.resolveAreaIndicatorMesh.bind(this)],
      [/tree/i, this.resolveTreeMesh.bind(this)],
      [/solar/i, this.resolveSolarBoardMesh.bind(this)],
    ]);
    const mapKeys = Array.from(meshResolveMap.keys());
    this.toolService.traverse(model, obj => {
      const objName = obj.name as string;
      if (obj.type === 'Mesh') {
        const mesh = obj as Mesh;
        const meshName = mesh.name;
        const type = mapKeys.find(reg => reg.test(meshName));
        const resolver = meshResolveMap.get(type);
        if (resolver) {
          resolver(mesh);
        } else if (obj.material.name === 'floor-mat') {
          this.resolveFloorMesh(mesh);
        } else if (!/floor/i.test(objName)) {
          this.resolveOthersMesh(mesh);
        }
      } else if (obj.type === 'PointLight') {
        const pointL = obj as PointLight;
        pointL.intensity = 1;
        pointL.distance = .7;
        pointL.decay = 1.78;
      } else if (obj.type === 'SpotLight') {
        this.resolveSpotLight(obj);
      } else if (/controller/i.test(objName)) {
        this.resolveController(obj);
      } else if (/floor-anchor/i.test(objName)) {
        this.resolveFloorAnchor(obj);
      } else if (/parking-anchor/i.test(objName)) {
        // this.parkingCenter = obj.position;
      } else if (/^buildingF\d/i.test(objName)) {
        this.resolveDatapoint(obj);
      }
    });

    this.addOthersMesh(model);
    this.addInsideBuildingMesh(model);
    this.addOutsideBuildingMesh(model);

    this.world.add(model);
    // this.load.loaded();
  }
  private resolveLabelMesh(mesh: Mesh) {
    mesh.material = this.materialsService.labelMat;
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveBaseMesh(mesh: Mesh) {
    mesh.material = this.materialsService.baseMat;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  private resolveGroundMesh(mesh: Mesh) {
    // console.log('ground', mesh);
    mesh.material = this.materialsService.groundMat;
    mesh.receiveShadow = true;
  }

  private resolveReflectMesh(mesh: Mesh) {
    mesh.material = this.materialsService.baseMat;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return;
  }

  private resolveDecoratorMesh(mesh: Mesh) {
    const target = mesh.position;
    // this.focusPos = target.clone();
    // compService.setCamera(this.focusCameraPos, target);

    const mat = this.materialsService.decoratorMat;
    mesh.material = mat;
    mat.emissiveMap.wrapT = RepeatWrapping;
    mat.emissiveMap.repeat.setY(2);

    let offsetY = 2;
    mesh.onBeforeRender = () => {
      mat.emissiveMap.offset.setY(offsetY);
      offsetY -= 0.01;
      if (offsetY < 0) {
        offsetY = 2;
      }
      mat.needsUpdate = true;
    };
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveColorSpotsMesh(mesh: Mesh) {
    // (mesh.material as Material).dispose();
    // mesh.material = this.materialsService.spotsMat;
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveBuildingMesh(mesh: Mesh) {
    const objName = mesh.name;
    (mesh.material as Material).dispose();

    const matsService = this.materialsService;
    if (objName.includes('outside')) {
      console.log('building outside mesh found', objName);
      // mesh.material = matsService.outsideBuildingMat;
      (this.outsideBuildingMesh.geometry as Geometry)
        .merge(this.toolService.geoFromBufferGeo(mesh.geometry as BufferGeometry));
      mesh.parent.remove(mesh);
      mesh.geometry.dispose();
    } else if (objName.includes('inside')) {
      console.log('building inside mesh found');
      mesh.material = matsService.insideBuildingMat;
      // mesh.layers.enable(LAYER.BLOOM_LAYER);
      // (this.insideBuildingMesh.geometry as Geometry)
      //     .merge(this.toolService.geoFromBufferGeo(mesh.geometry as BufferGeometry));
      // mesh.parent.remove(mesh);
      // mesh.geometry.dispose();
    } else if (objName.includes('lightport')) {
      // const lightColor = new Color();
      // lightColor.setHSL(126/255, 237/255, 80/255);
      // mesh.material = new MeshStandardMaterial({
      //   color: lightColor,
      //   emissiveIntensity: .2,
      //   emissive: lightColor,
      //   metalness: 1,
      //   roughness: 1
      // });
      // mesh.layers.enable(LAYER.BLOOM_LAYER);
    } else {
      mesh.material = matsService.mainBuildingMat;
      // (mesh as any).on('click', () => {
      //     this.mainBuildingClicked();
      // });
      // (mesh as any).on('touch', () => {
      //     // console.log('main building touched');
      //     // if (!this.isFocusOnBuilding) {
      //     //     // TODO
      //     //     this.router.navigate(['whole-building']);
      //     // }
      //     // // this.focusBuilding();
      //     this.mainBuildingClicked();
      // });
      // mesh.layers.enable(LAYER.BLOOM_LAYER);
    }

    if (objName.includes('1')) {
      this.buildingCenter = mesh.position.clone();
    }

    mesh.castShadow = true;
    // mesh.receiveShadow = true;
  }

  private resolveFloorMesh(mesh: Mesh) {
    // matsService.setFloorMat(obj.material);
    // obj.material = obj.material.clone();
    // return;
    (mesh.material as Material).dispose();
    const names = [/floor-1.+/i, /floor-2.+/i, /floor-3.+/i];
    let matched = false;
    for (let i = 0; i < names.length && !matched; i++) {
      matched = this.toolService.hasAncestorWithName(mesh, names[i]);
      if (matched) {
        mesh.material = this.materialsService[`floor${i + 1}Mat`];
      }
    }
  }

  private resolveFloorAnchor(anchor: Object3D) {
    // const rectLight = new RectAreaLight(0xffffff, 1, 1, 1);
    // rectLight.position.copy(anchor.position);
    // rectLight.position.y += .1;
    // rectLight.rotateX(-90);
    // anchor.parent.add(rectLight);

    const light = new PointLight(0xffffff, 1, 1);
    // const floorIdx = anchor.name.replace(/floor-anchor-([0-9]+)/g, '$1');
    // light.name = `floor-light-${floorIdx}`;
    light.name = `floor-point-light`;
    light.position.copy(anchor.position);
    light.position.y += .1;
    anchor.parent.add(light);

    // const boxGeo=new BoxGeometry(.1, .1, .1);
    // const mat=new MeshBasicMaterial({color:0x00ff00});
    // const box=new Mesh(boxGeo,mat);
    // box.position.copy(anchor.position);
    // anchor.parent.add(box);
  }

  private resolveDatapoint(dpObj: Object3D) {
    // const type = dpObj.name.replace(/dp_(^[0-9]*)[0-9]+/i, '$1');
    const type = dpObj.name.replace(/^buildingF\d(.+?)\d$/, '$1');
    const floorCtrl = this.toolService.findAncestorLike(dpObj, /floor.+controller/i);
    const floorIdx = this.toolService.floorIdxFromFloorCtllerName(floorCtrl.name);
    // const dpSetting = this[`f${floorIdx + 1}EnergyPointsSetting`][dpObj.name];
    // dpSetting.trigger = () => {
    //     console.log(`${dpObj.name} setting updated`);
    // };
    // Store into storage
    // this.datapointCollection[`f${floorIdx + 1}`].push({
    //   obj: dpObj,
    //   type,
    //   floorIdx,
    //   coords: null,
    //   setting: null
    // });
  }

  private resolveRoadLightMesh(mesh: Mesh) {
    // console.log('road light', mesh);

    const mat = this.materialsService.roadLightMat;
    mesh.material = mat;

    let offsetX = 1;
    mesh.onBeforeRender = () => {
      mat.map.offset.setX(offsetX);
      offsetX -= 0.005;
      if (offsetX < 0) {
        offsetX = 1;
      }
      mat.needsUpdate = true;
    };

    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveParkingAreaMesh(mesh: Mesh) {
    console.log('parking', mesh.name);

    if (/border/gi.test(mesh.name)) {
      // mesh.parent.remove(mesh);
      return;
    } else {

    }
  }

  private resolveDoorMesh(mesh: Mesh) {
    // (mesh.material as Material).dispose();
    // mesh.material=
  }

  private resolveAreaIndicatorMesh(mesh: Mesh) {
    (mesh.material as Material).dispose();
    // mesh.material = this.materialsService.areaIndicatorMat.clone();
    mesh.material = this.materialsService.areaIndicatorMat;
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveLightBorderMesh(mesh: Mesh) {
    // (mesh.material as Material).dispose();
    mesh.material = this.materialsService.lightBorderMat;
    // const mat = mesh.material as MeshStandardMaterial;
    // mat.metalness = 1;
    // mat.roughness = 0;
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveOthersMesh(mesh: Mesh) {
    // return;
    // Set it to base material
    // mesh.material = this.materialsService.baseMat;
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;
    if (
      /BezierCurve/i.test(mesh.name) ||
      /flag-tower/.test(mesh.name)
    ) {
      mesh.castShadow = true;
      // console.log('Curve mesh found', mesh);
      return;
    }
    // (this.othersMesh.geometry as Geometry).mergeMesh(mesh);
    (this.othersMesh.geometry as Geometry).merge(this.toolService.geoFromBufferGeo(mesh.geometry as BufferGeometry));
    mesh.parent.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as Material).dispose();
  }

  private resolveTreeMesh(mesh: Mesh) {
    (mesh.material as Material).dispose();
    if (/ball/gi.test(mesh.name)) {
      console.log('tree ball mesh found');
      mesh.material = this.materialsService.treeBallMat;
    } else {
      mesh.material = this.materialsService.treeMat;
    }
    // mesh.layers.enable(LAYER.BLOOM_LAYER);
  }

  private resolveSolarBoardMesh(mesh: Mesh) {
    (mesh.material as Material).side = DoubleSide;
  }

  private resolveSpotLight(light: SpotLight) {
    const name = light.name;
    const lightColor = new Color();
    lightColor.setHSL(125 / 255, 240 / 255, 132 / 255);
    // console.log('spot light', light);
    light.color = lightColor;
    // light.position.multiplyScalar(100);
    const idx = Number(name.replace(/spot([0-9]).+?/gi, '$1'));
    switch (idx) {
      case 1:
        // light.intensity = 2.92;
        light.intensity = 1;
        light.angle = 0.279;
        light.castShadow = true;
        // light.distance = 17.14;
        break;
      case 2:
        light.intensity = 1;
        light.angle = 0.339;
        light.castShadow = true;
        // light.distance = 12.14;
        break;
      default:
        // light.angle = 1.179;
        light.castShadow = true;
        // light.intensity = 1.68;
        light.intensity = .3;
      // light.position.setY(.88);
    }
  }

  private resolveController(obj: Object3D) {
    const name = obj.name;
    if (name.includes('outer-wall')) {
    } else if (name.includes('floor')) {
      const idx = this.toolService.floorIdxFromFloorCtllerName(name);

      const wallMesh = obj.getObjectByName(`floor-wall-${idx + 1}`);
      if (wallMesh) {
        wallMesh.visible = false;
      }
    }
  }


  private addOthersMesh(obj: Object3D) {
    this.othersMesh.scale.setScalar(.01);
    this.othersMesh.rotateX(Math.PI / 2);
    obj.add(this.othersMesh);
    this.othersMesh.geometry.dispose();
  }

  private addOutsideBuildingMesh(obj: Object3D) {
    this.outsideBuildingMesh.scale.setScalar(.01);
    this.outsideBuildingMesh.rotateX(Math.PI / 2);
    obj.add(this.outsideBuildingMesh);
    this.outsideBuildingMesh.geometry.dispose();
  }

  private addInsideBuildingMesh(obj: Object3D) {
    this.insideBuildingMesh.scale.setScalar(.01);
    this.insideBuildingMesh.rotateX(Math.PI / 2);
    obj.add(this.insideBuildingMesh);
    this.insideBuildingMesh.geometry.dispose();
  }
}
