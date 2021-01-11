import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, EventEmitter } from '@angular/core';
import URDFRobot from 'urdf-loader';
import * as THREE from 'three';
import { WorldService } from 'src/app/service/world/world.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, Observable } from 'rxjs';
import { Intersection, Object3D } from 'three';
import { EventEmitService } from 'src/app/service/event/event-emit.service';
import { CommandService } from 'src/app/service/command/command.service';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';
import { AnimationService } from 'src/app/service/animation/animation.service';
import { ResizeEvent } from 'angular-resizable-element';
import { ThrowStmt } from '@angular/compiler';
import { PointService } from 'src/app/service/point/point.service';
import { Point } from 'src/app/components/point-list/point-list.component';
@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
})
export class AnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs: Subscription[] = [];
  robot: URDFRobot;
  animation: number;
  curPanel: 'motion' | 'property' | null = 'property';
  curObj: Object3D;
  visible = false;
  maxPanelWidth: number = Math.floor(window.innerWidth * 0.5);
  minPanelwidth: number = Math.floor(window.innerWidth * 0.2);
  public panelList = [
    {
      name: 'property',
      icon: 'setting'
    },
    {
      name: 'motion',
      icon: 'edit'
    },
    {
      name: 'library',
      icon: 'book'
    }
  ];
  public toolList = [
    {
      name: 'play',
      icon: 'play-circle',
      fun: this.deploy.bind(this)
    },
    {
      name: 'stop',
      icon: 'pause-circle',
      fun: this.stop.bind(this)
    },
    {
      name: 'undo',
      icon: 'undo',
      fun: this.undo.bind(this)
    },
    {
      name: 'redo',
      icon: 'redo',
      fun: this.redo.bind(this)
    }
  ];
  public transformMode = [
    {
      name: 'translate',
      isActive: true,
      icon: 'drag'
    },
    {
      name: 'rotate',
      isActive: false,
      icon: 'retweet'
    },
    // {
    //   name: 'scale',
    //   isActive: false,
    //   imgSrc: 'assets/icon/scale.svg',
    // }
  ];
  public projectId: string;
  constructor(
    private worldService: WorldService,
    private router: Router,
    private route: ActivatedRoute,
    private eventEmitService: EventEmitService,
    private commandService: CommandService,
    private AnimationService: AnimationService,
    private pointService: PointService
  ) { }
  @ViewChild('animation') div: ElementRef;
  @ViewChild('tool') tool: ElementRef;
  @ViewChild('load') load: LoadBarComponent;

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
    this.subs.push(this.eventEmitService.emitClick.subscribe((e: Intersection[]) => {
      this.worldService.select(e);
    }));
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.init();
    }, 0);

  }
  ngOnDestroy() {
    this.worldService.removeEvent();
    this.subs.forEach(s => s.unsubscribe());
    cancelAnimationFrame(this.animation);
  }
  public async init() {
    this.worldService.setWorld(this.div.nativeElement);
    this.worldService.initPlane();
    this.route.params.subscribe((res)=>{
      this.projectId = res.id;
    })
  }

  public changeTransformMode(e) {
    this.worldService.transformControls.setMode(e.name);
    e.isActive = true;
    for (const i of this.transformMode) {
      if (i !== e) {
        i.isActive = false;
      }
    }
  }
  public changeTool(e) {
    if (e.name === this.curPanel) {
      this.curPanel = null;
      this.worldService.updateSize();
      // this.router.navigate([`/world/animation}`]);
      setTimeout(()=>{
        this.worldService.updateSize();
      })

    } else {
      this.curPanel = e.name;
      this.router.navigate([`world/project/${this.projectId}/${e.name}`]);
    }

  }
  public trigger() {

  }
  public async deploy(){
    this.curObj = this.worldService.getCurObj();
    if(!this.curObj|| this.curObj.userData.type !=='robot'){
      return
    }
    const pointList:Point[] = this.pointService.getPointList();
    for(let p of pointList){
      await this.AnimationService.movePTP(p,3000,this.curObj);
    }
  }
  // public deploy() {
  //   this.subs.forEach(s => s.unsubscribe());
  //   const node = [1, 3, 2, 4, 5, 6];
  //   const link = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 2]];
  //   const nodeMap: Map<number, Subject<void>> = new Map();
  //   const linkMap: Map<number, Subject<void>[]> = new Map();
  //   node.forEach(n => {
  //     nodeMap.set(n, new Subject());
  //     linkMap.set(n, []);
  //   });
  //   link.forEach(l => {
  //     const nexts = linkMap.get(l[0]);
  //     const next = nodeMap.get(l[1]);
  //     linkMap.set(l[0], [...nexts, next]);
  //   });
  //   this.subs = [];
  //   nodeMap.forEach((subject, n) => {
  //     this.subs.push(subject.subscribe(async () => {
  //       setTimeout(() => {
  //         const subjects = linkMap.get(n);
  //         if (n === 3) {
  //           subjects[0].next();
  //           return;
  //         }
  //         subjects.forEach(s => {
  //           s.next();
  //         });
  //       }, 2000);

  //     }));
  //   });
  //   const start = nodeMap.get(1);
  //   start.next();
  // }
  stop() {
    this.subs.forEach(s => s.unsubscribe());
  }
  undo() {
    this.commandService.undo();
  }
  redo() {
    this.commandService.redo();
  }
  setSignal() {
    // this.event.next(1);
  }
  onResizeEnd(event: ResizeEvent): any {
    if (event.rectangle.width < this.minPanelwidth) {
      this.tool.nativeElement.style.width = `${0}px`;
      this.tool.nativeElement.style.border  = 'none';
      setTimeout(() => {
        this.worldService.updateSize();
        this.curPanel = null;
      }, 0);
    }
    if (event.rectangle.width > this.maxPanelWidth) {
      this.tool.nativeElement.style.width = `${this.maxPanelWidth}px`;
      setTimeout(() => {
        this.worldService.updateSize();
      }, 0);
    }
  }
  onResizing(event: ResizeEvent): void {
    this.tool.nativeElement.style.width = `${event.rectangle.width}px`;
    this.worldService.updateSize();
  }
  dragenter(event: DragEvent): void {

  }
  dragover(event: DragEvent): void {
    event.preventDefault();
  }
  async drop(event:DragEvent): Promise<void>{
    const device = JSON.parse(event.dataTransfer.getData('device'));
    const position = this.worldService.screenPointToThreeCoords(event.offsetX,event.offsetY,this.div.nativeElement,0);
    Object.assign(device,{
      position:position
    })
    const obj = await this.worldService.initObject(device);
    this.worldService.addObject(obj);

  }
  dragleave(e:DragEvent){

  }
  gotoProject() {
    this.router.navigate(['/world/projects']);
  }
  save(){
    // const objects = new Array();
    // for(let o of this.worldService.objects){
    //   const json = o.toJSON();
    //   const object = {
    //     name:o.userData.name, 
    //     id:o.userData.id,
    //     parentId:o.parent.userData.id,
    //     matrix:json.data.matrix
    //   };
    //   objects.push(object);
    // }
    this.worldService.save();
    // this.projectService.save(p)
  }
}
