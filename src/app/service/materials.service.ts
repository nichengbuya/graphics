import { Injectable } from '@angular/core';
import { MeshStandardMaterial, MeshBasicMaterial, DoubleSide, CanvasTexture, Color, TextureLoader, RepeatWrapping, RawShaderMaterial, PerspectiveCamera, Scene, WebGLRenderer, Vector2, Matrix4 } from 'three';
// import { GkcSceneService } from './gkc-scene.service';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { TexturesService } from './textures.service';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
// import { environment } from 'src/environments/environment';
// import { reflectVShader, reflectFShader } from './material.shader';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {
  params: any;

  mainBuildingMat: MeshStandardMaterial;
  floor1Mat: MeshStandardMaterial;
  floor2Mat: MeshStandardMaterial;
  floor3Mat: MeshStandardMaterial;
  floor4Mat: MeshStandardMaterial;
  // floorMat: MeshBasicMaterial;
  spotsMat: MeshBasicMaterial;
  outsideBuildingMat: MeshStandardMaterial;
  insideBuildingMat: MeshStandardMaterial;
  edgeLineMat: any;
  decoratorMat: MeshStandardMaterial;
  labelMat: MeshStandardMaterial;
  baseMat: MeshStandardMaterial;
  groundMat: MeshStandardMaterial;
  roadLightMat: MeshBasicMaterial;
  lightBorderMat: MeshBasicMaterial;
  parkingMat: MeshBasicMaterial;
  areaIndicatorMat: MeshBasicMaterial;
  treeMat: MeshBasicMaterial;
  treeBallMat: MeshBasicMaterial;
  // reflectMat: RawShaderMaterial;

  constructor(
    // private compService: GkcSceneService,
    private texturesService: TexturesService
  ) {
    this.params = {
      buildingLightRange: 1,
      buildingLightColor: '#053d5c',
      buildingLightStopColor: '#2a80af',
      buildingEmissive: '#fff',
      buildingEmissiveIntensity: .17,
      buildingBaseColor: '#003646',

      floorColor: '#00dcff',
      floorEmissive: '#00dcff',
      floorEmissiveIntensity: 1,
      floorMetalness: .5,
      floorRoughness: .5,
      floorOpacity: .8,

      outsideColor: '#4bb2c2',
      outsideEmissiveIntensity: 1,
      outsideMetalness: .8,
      outsideRoughness: .44,
      outsideBuildingEmissiveIntensity: .5,

      insideColor: '#4bb2c2',
      insideMetalness: .8,
      insideRoughness: .77,
      insideBuildingEmissiveIntensity: .5,

      areaIndicatorColor1: '#1e8282',
      areaIndicatorColor2: '#fff',
      areaIndicatorOpacity: .5,

      labelColor: '#186b84',

      spotsColor: '#4bb2c2',

      bottomLightStartColor: '#0b141b',
      bottomLightEndColor: '#235171',

      horiLineColor: '#69c1e8',

      decoratorRange: 1,
      decoratorColor: '#95a9b3',
      decoratorEndColor: '#000',


      lightBorderColor: '#257987',
      // edgeLineColor: '#2b667a',
      // edgeWidth: .006,
      // edgeDashGap: 10,
      // edgeDashLen: 100,

      baseColor: '#083c4a',
      baseMetalness: 0.88,
      baseRougthness: .68,

      groundColor: '#0b1318',
      groundMetalness: 0.84,
      groundRougthness: .35,

      roadLightSColor: '#f27127',
      roadLightEColor: '#000000',
      roadLightOpacity: .78,

      treeColor: '#0a5464',
      treeBallColor: '#316772'

    };

    this.mainBuildingMat = this.genBuildingMat();
    this.outsideBuildingMat = this.genOutsideBuildingMat();
    this.insideBuildingMat = this.genInsideBuildingMat(this.outsideBuildingMat);

    this.floor1Mat = new MeshStandardMaterial({
      color: this.params.floorColor,
      emissive: this.params.floorEmissive,
      emissiveIntensity: this.params.floorEmissiveIntensity,
      metalness: this.params.floorMetalness,
      roughness: this.params.floorRoughness,
      transparent: true,
      opacity: this.params.floorOpacity,
      side: DoubleSide
    });
    this.floor1Mat.userData.initOpacity = this.params.floorOpacity;

    this.floor2Mat = this.floor1Mat.clone();
    this.floor3Mat = this.floor1Mat.clone();
    this.floor4Mat = this.floor1Mat.clone();
    // this.floorMat = new MeshBasicMaterial({
    //   color: this.params.floorColor,
    //   transparent: true,
    //   opacity: this.params.floorOpacity,
    //   side: DoubleSide
    // });

    this.labelMat = new MeshStandardMaterial({
      color: this.params.labelColor,
      emissive: this.params.labelColor,
      emissiveIntensity: 1
    });
    this.baseMat = new MeshStandardMaterial({
      color: this.params.baseColor,
      roughness: this.params.baseRougthness,
      metalness: this.params.baseMetalness,
    });
    this.groundMat = new MeshStandardMaterial({
      color: this.params.groundColor,
      roughness: this.params.groundRougthness,
      metalness: this.params.groundMetalness
    });
    // this.edgeLineMat = new LineDashedMaterial({
    //   color: 0x40a2c4,
    //   dashSize: 100,
    //   gapSize: 10,
    // });
    this.edgeLineMat = new LineMaterial({
      color: 0x2b667a,
      // dashSize: 100,
      // gapSize: 10,
      dashed: false,
      linewidth: 0.006
    });
    this.spotsMat = new MeshBasicMaterial({
      color: '#4bb2c2',
      side: DoubleSide
    });
    this.decoratorMat = this.genDecoratorMat();
    this.roadLightMat = this.genRoadLightMat();
    this.lightBorderMat = new MeshBasicMaterial({
      color: this.params.lightBorderColor
    });

    this.parkingMat = new MeshBasicMaterial({
      alphaMap: new TextureLoader().load('assets/img/parking-opacity-tex.png'),
      transparent: true,
      // emissiveIntensity: 1,
      // metalness: 1,
      // roughness: 1
    });

    // new TextureLoader().load('resource/img/parking-opacity-tex.png', (tex) => {
    //   this.parkingMat.alphaMap = tex;
    //   // this.parkingMat.emissiveMap = tex;
    // });

    this.areaIndicatorMat = new MeshBasicMaterial({
      color: this.params.areaIndicatorColor1,
      transparent: true,
      opacity: this.params.areaIndicatorOpacity
    });

    this.treeMat = new MeshBasicMaterial({
      color: this.params.treeColor
    });
    this.treeBallMat = new MeshBasicMaterial({
      color: this.params.treeBallColor
    });

    // if (!environment.production) {
    //   this.initGUI(compService.gui);
    // }
  }

  // setFloorMat(mat: MeshStandardMaterial) {
  //   mat.transparent = true;
  //   mat.opacity = .9;
  //   mat.metalness = 0;
  //   mat.roughness = .8;
  //   mat.side = DoubleSide;
  //   this.floorMat = mat;
  // }
  initGUI(gui: GUI) {
    const texService = this.texturesService;

    const mainBuildingFolder = gui.addFolder('Main Building');
    mainBuildingFolder.addColor(this.params, 'buildingLightColor').onChange(color => {
      const params = this.params;
      texService.drawBuildingTopLight(texService.buildingTexCanvas,
        params.buildingLightRange,
        color,
        params.buildingLightStopColor
      );
      this.mainBuildingMat.emissiveMap.needsUpdate = true;
    });
    mainBuildingFolder.addColor(this.params, 'buildingLightStopColor').onChange(color => {
      texService.drawBuildingTopLight(
        texService.buildingTexCanvas,
        this.params.buildingLightRange,
        this.params.buildingLightColor,
        color
      );
      this.mainBuildingMat.emissiveMap.needsUpdate = true;
    });
    mainBuildingFolder.addColor(this.params, 'buildingEmissive').onChange(color => {
      this.mainBuildingMat.emissive = new Color(color);
    });
    mainBuildingFolder.add(this.params, 'buildingEmissiveIntensity', 0, 1).onChange(val => {
      this.mainBuildingMat.emissiveIntensity = Number(val);
    });
    mainBuildingFolder.addColor(this.params, 'buildingBaseColor').onChange(color => {
      this.mainBuildingMat.color = new Color(color);
    });
    mainBuildingFolder.addColor(this.params, 'spotsColor').onChange(color => {
      this.spotsMat.color = color;
      this.spotsMat.needsUpdate = true;
    });

    const floorsFolder = gui.addFolder('Floors');
    floorsFolder.addColor(this.params, 'floorColor').onChange(color => {
      this.floor1Mat.color = new Color(color);
    });
    floorsFolder.addColor(this.params, 'floorEmissive').onChange(color => {
      this.floor1Mat.emissive = new Color(color);
    });
    floorsFolder.add(this.params, 'floorEmissiveIntensity', 0, 1).onChange(val => {
      this.floor1Mat.emissiveIntensity = Number(val);
    });
    floorsFolder.add(this.params, 'floorMetalness', 0, 1).onChange(val => {
      this.floor1Mat.metalness = Number(val);
    });
    floorsFolder.add(this.params, 'floorRoughness', 0, 1).onChange(val => {
      this.floor1Mat.roughness = Number(val);
    });
    floorsFolder.add(this.params, 'floorOpacity', 0, 1).onChange(val => {
      this.floor1Mat.opacity = Number(val);
    });

    const areaIndicatorFolder = gui.addFolder('Area Indicator Color');
    areaIndicatorFolder.addColor(this.params, 'areaIndicatorColor1').onChange(color => {
      this.areaIndicatorMat.color = new Color(color);
    });
    areaIndicatorFolder.add(this.params, 'areaIndicatorOpacity', 0, 1).onChange(val => {
      this.areaIndicatorMat.opacity = Number(val);
    });

    const lightFolder = gui.addFolder('Building Light');
    // lightFolder.add(this.params, 'buildingLightRange', 0, 1).onChange(val => {
    //   this.drawBuildingTopLight(this.buildingTexCanvas, Number(val), this.params.buildingLightColor, 'black');
    //   this.mainBuildingMat.emissiveMap.needsUpdate = true;
    // });
    // bottom light
    lightFolder.addColor(this.params, 'bottomLightStartColor').onChange(color => {
      texService.drawBuildingTopLight(texService.bottomLightTexCanvas, 1, color, this.params.bottomLightEndColor);
      texService.bottomLightTex.needsUpdate = true;

      texService.drawBuildingTopLight(texService.insideBuildingCanvas, 1, color, this.params.bottomLightEndColor);
      texService.drawHoriLinesTex(texService.insideBuildingCanvas, this.params.horiLineColor);
      texService.insideBuildingTex.needsUpdate = true;
    });
    lightFolder.addColor(this.params, 'bottomLightEndColor').onChange(color => {
      texService.drawBuildingTopLight(texService.bottomLightTexCanvas, 1, this.params.bottomLightStartColor, color);
      texService.bottomLightTex.needsUpdate = true;

      texService.drawBuildingTopLight(texService.insideBuildingCanvas, 1, this.params.bottomLightStartColor, color);
      texService.drawHoriLinesTex(texService.insideBuildingCanvas, this.params.horiLineColor);
      texService.insideBuildingTex.needsUpdate = true;
    });

    // hori lines
    lightFolder.addColor(this.params, 'horiLineColor').onChange(color => {
      texService.drawHoriLinesTex(texService.horiLineTexCanvas, color);
      texService.horiLineTex.needsUpdate = true;

      texService.drawHoriLinesTex(texService.insideBuildingCanvas, color);
      texService.insideBuildingTex.needsUpdate = true;
    });

    const insideBuildingFolder = gui.addFolder('Inside Building');
    insideBuildingFolder.addColor(this.params, 'insideColor').onChange(color => {
      this.insideBuildingMat.color = new Color(color);
    });
    insideBuildingFolder.add(this.params, 'insideMetalness', 0, 1).onChange(val => {
      this.insideBuildingMat.metalness = Number(val);
    });
    insideBuildingFolder.add(this.params, 'insideRoughness', 0, 1).onChange(val => {
      this.insideBuildingMat.roughness = Number(val);
    });
    insideBuildingFolder.add(this.params, 'insideBuildingEmissiveIntensity', 0, 1).onChange(val => {
      if (this.insideBuildingMat) {
        this.insideBuildingMat.emissiveIntensity = Number(val);
        this.insideBuildingMat.needsUpdate = true;
      }
    });

    const outsideBuildingFolder = gui.addFolder('Outside Building');
    outsideBuildingFolder.add(this.params, 'outsideMetalness', 0, 1).onChange(val => {
      this.outsideBuildingMat.metalness = Number(val);
    });
    outsideBuildingFolder.add(this.params, 'outsideRoughness', 0, 1).onChange(val => {
      this.outsideBuildingMat.roughness = Number(val);
    });
    outsideBuildingFolder.add(this.params, 'outsideBuildingEmissiveIntensity', 0, 1).onChange(val => {
      if (this.outsideBuildingMat) {
        this.outsideBuildingMat.emissiveIntensity = Number(val);
        this.outsideBuildingMat.needsUpdate = true;
      }
    });


    gui.addColor(this.params, 'labelColor').onChange(color => {
      const newColor = new Color(color);
      this.labelMat.color = this.labelMat.emissive = newColor;
    });

    gui.addColor(this.params, 'lightBorderColor').onChange(color => {
      this.lightBorderMat.color = new Color(color);
    });

    const treeFolder = gui.addFolder('Tree');
    treeFolder.addColor(this.params, 'treeColor').onChange(color => {
      this.treeMat.color = new Color(color);
    });
    treeFolder.addColor(this.params, 'treeBallColor').onChange(color => {
      this.treeBallMat.color = new Color(color);
    });

    // const edgeFolder = gui.addFolder('Edge Line');
    // edgeFolder.addColor(this.params, 'edgeLineColor').onChange(color => {
    //   this.edgeLineMat.color = new Color(color);
    //   // this.edgeLineMat.needsUpdate = true;
    // });
    // edgeFolder.add(this.params, 'edgeWidth', 0, 10).onChange(val => {
    //   this.edgeLineMat.linewidth = Number(val);
    // });
    // edgeFolder.add(this.params, 'edgeDashGap', 0, 100).onChange(val => {
    //   this.edgeLineMat.gapSize = Number(val);
    //   this.edgeLineMat.needsUpdate = true;
    // });
    // edgeFolder.add(this.params, 'edgeDashLen', 0, 100).onChange(val => {
    //   this.edgeLineMat.dashSize = Number(val);
    //   this.edgeLineMat.needsUpdate = true;
    // });

    const decoratorFolder = gui.addFolder('Decorator');
    decoratorFolder.add(this.params, 'decoratorRange', 0, 1).onChange(val => {
      const params = this.params;
      texService.drawHoriGaussianLine(
        texService.decoratorTexCanvas,
        Number(val),
        params.decoratorColor,
        params.decoratorEndColor
      );
      this.decoratorMat.emissiveMap.needsUpdate = true;
    });
    decoratorFolder.addColor(this.params, 'decoratorColor').onChange(color => {
      const params = this.params;
      texService.drawHoriGaussianLine(
        texService.decoratorTexCanvas,
        params.decoratorRange,
        color,
        params.decoratorEndColor
      );
      this.decoratorMat.emissiveMap.needsUpdate = true;
    });
    decoratorFolder.addColor(this.params, 'decoratorEndColor').onChange(color => {
      const params = this.params;
      texService.drawHoriGaussianLine(
        texService.decoratorTexCanvas,
        params.decoratorRange,
        params.decoratorColor,
        color
      );
      this.decoratorMat.emissiveMap.needsUpdate = true;
    });

    const baseFolder = gui.addFolder('Base');
    baseFolder.addColor(this.params, 'baseColor').onChange(color => {
      this.baseMat.color = new Color(color);
      // this.baseMat.needsUpdate = true;
    });
    baseFolder.add(this.params, 'baseMetalness', 0, 1).onChange(val => {
      this.baseMat.metalness = Number(val);
      // this.baseMat.needsUpdate = true;
    });
    baseFolder.add(this.params, 'baseRougthness', 0, 1).onChange(val => {
      this.baseMat.roughness = Number(val);
      // this.baseMat.needsUpdate = true;
    });

    const groundFolder = gui.addFolder('Ground');
    groundFolder.addColor(this.params, 'groundColor').onChange(color => {
      this.groundMat.color = new Color(color);
      // this.groundMat.needsUpdate = true;
    });
    groundFolder.add(this.params, 'groundMetalness', 0, 1).onChange(val => {
      this.groundMat.metalness = Number(val);
      // this.groundMat.needsUpdate = true;
    });
    groundFolder.add(this.params, 'groundRougthness', 0, 1).onChange(val => {
      this.groundMat.roughness = Number(val);
      // this.groundMat.needsUpdate = true;
    });

    const roadLightFolder = gui.addFolder('Road Light');
    // roadLightFolder.addColor(this.params, 'roadLightSColor').onChange(color => {
    //   texService.drawHoriGaussianLine(texService.roadLightCanvas, 1, color, this.params.roadLightEColor);
    //   this.roadLightMat.emissiveMap.needsUpdate = true;
    // });
    // roadLightFolder.addColor(this.params, 'roadLightEColor').onChange(color => {
    //   texService.drawHoriGaussianLine(texService.roadLightCanvas, 1, this.params.roadLightSColor, color);
    //   this.roadLightMat.emissiveMap.needsUpdate = true;
    // });
    roadLightFolder.add(this.params, 'roadLightOpacity', 0, 1).onChange(val => {
      this.roadLightMat.opacity = Number(val);
    });
  }

  // genReflectMat(renderer: WebGLRenderer, camera: PerspectiveCamera) {
  //   const canvas = renderer.domElement;
  //   return new RawShaderMaterial({
  //     uniforms: {
  //       resolution: { value: new Vector2(canvas.width, canvas.height) },
  //       cameraWorldMatrix: { value: camera.matrixWorld },
  //       cameraProjectionMatrixInverse: { value: new Matrix4().getInverse(camera.projectionMatrix) }
  //     },
  //     vertexShader: reflectVShader,
  //     fragmentShader: reflectFShader
  //   });
  // }

  private genBuildingMat() {
    const texService = this.texturesService;
    const params = this.params;
    texService.drawBuildingTopLight(
      texService.buildingTexCanvas,
      params.buildingLightRange,
      params.buildingLightColor,
      params.buildingLightStopColor
    );

    const mat = new MeshStandardMaterial({
      color: params.buildingBaseColor,
      emissiveIntensity: params.buildingEmissiveIntensity,
      emissive: params.buildingEmissive,
      emissiveMap: new CanvasTexture(texService.buildingTexCanvas),
      side: DoubleSide
    });

    return mat;
  }

  private genOutsideBuildingMat() {
    const texService = this.texturesService;

    texService.drawBuildingTopLight(texService.bottomLightTexCanvas, 1, '#0b141b', '#235171');
    texService.drawHoriLinesTex(texService.horiLineTexCanvas, '#69c1e8');
    texService.bottomLightTex.needsUpdate = true;
    texService.horiLineTex.needsUpdate = true;

    const mat = new MeshStandardMaterial({
      color: new Color(this.params.outsideColor),
      map: texService.bottomLightTex,
      emissiveIntensity: this.params.outsideBuildingEmissiveIntensity,
      emissive: 0xffffff,
      emissiveMap: texService.horiLineTex,
      side: DoubleSide,
      metalness: this.params.outsideMetalness,
      roughness: this.params.outsideRoughness
    });
    return mat;
  }

  private genInsideBuildingMat(outsideMat: MeshStandardMaterial) {
    const texService = this.texturesService;

    const mat = outsideMat.clone();
    texService.drawBuildingTopLight(texService.insideBuildingCanvas, 1, '#0b141b', '#235171');
    texService.drawHoriLinesTex(texService.insideBuildingCanvas, '#69c1e8');
    mat.emissiveMap = texService.insideBuildingTex;
    Object.assign(mat, {
      emissiveIntensity: this.params.insideBuildingEmissiveIntensity,
      color: new Color(this.params.insideColor),
      metalness: this.params.insideMetalness,
      roughness: this.params.insideRoughness
    });
    return mat;
  }

  private genDecoratorMat() {
    // this.decoratorTexCanvas = document.createElement('canvas');
    // this.decoratorTexCanvas.width = 512;
    // this.decoratorTexCanvas.height = 512;
    const texService = this.texturesService;
    const params = this.params;
    texService.drawHoriGaussianLine(
      texService.decoratorTexCanvas,
      params.decoratorRange,
      params.decoratorColor,
      params.decoratorEndColor
    );

    const mat = new MeshStandardMaterial({
      color: 0x000,
      emissiveIntensity: 1,
      emissive: 0xffffff,
      emissiveMap: new CanvasTexture(texService.decoratorTexCanvas)
    });
    return mat;
  }

  private genRoadLightMat() {
    const texService = this.texturesService;
    texService.drawHoriGaussianLine(texService.roadLightCanvas, 1, '#f27127', 'transparent');


    // const mat = new MeshStandardMaterial({
    //   // emissiveMap: texService.roadLightTex,
    //   emissiveMap: new TextureLoader().load('resource/img/route-light-tex.png'),
    //   transparent: true,
    //   opacity: .98,
    //   metalness: 1,
    //   roughness: 0
    // });
    const mat = new MeshBasicMaterial({
      map: new TextureLoader().load('assets/img/route-light-tex5.png'),
      // map: texService.roadLightTex,
      transparent: true,
      opacity: .8
    });
    mat.map.wrapS = RepeatWrapping;
    return mat;
  }
}
