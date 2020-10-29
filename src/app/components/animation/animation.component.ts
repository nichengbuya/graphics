import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, EventEmitter } from '@angular/core';
import URDFRobot from 'urdf-loader';
import { LoadBarComponent } from '../load-bar/load-bar.component';
import * as THREE from 'three';
import { WorldService } from 'src/app/service/world.service';
import World from '../common/world';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { Intersection, Object3D } from 'three';
import { EventEmitService } from 'src/app/service/event-emit.service';
@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
})
export class AnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs: Subscription[] = [];
  world: World;
  robot: URDFRobot;
  animation: number;
  curPanel: 'libaray'|'property'|null = null;
  curObj: Object3D;
  public panelList = [
    {
      name: 'library',
      icon: 'book',
    },
    {
      name: 'property',
      icon: 'setting'
    }
  ];
  public toolList = [
    {
      name: 'play',
      icon: 'caret-right',
      fun: this.deploy.bind(this)
    },
    {
      name: 'stop',
      icon: '',
      fun: this.setSignal.bind(this)
    }
  ];
  public transformMode = [
    {
      name: 'translate',
      isActive: true,
      imgSrc: 'assets/icon/trans.svg',
    },
    {
      name: 'rotate',
      isActive: false,
      imgSrc: 'assets/icon/rotation.svg',
    },
    {
      name: 'scale',
      isActive: false,
      imgSrc: 'assets/icon/scale.svg',
    }
  ];
  constructor(
    private worldService: WorldService,
    private router: Router,
    private eventEmitService: EventEmitService
  ) { }
  @ViewChild('animation') div: ElementRef;
  @ViewChild('load') load: LoadBarComponent;

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
    this.subs.push(this.eventEmitService.emitClick.subscribe((e: Intersection[]) => {
      this.worldService.select(e);
    }));
  }
  ngAfterViewInit() {
    this.init();
  }
  ngOnDestroy() {
    this.worldService.removeEvent();
    document.removeEventListener('keydown', this.keyDownEvent);
    this.subs.forEach(s => s.unsubscribe());
    cancelAnimationFrame(this.animation);
  }
  public async init() {
    this.worldService.setWorld(this.div.nativeElement);
    this.worldService.initPlane();
  }
  private keyDownEvent = (event) => {
    if (event.keyCode === 46) {
      this.worldService.remove(this.curObj);
    }
  }
  animate() {
    this.animation = requestAnimationFrame(this.animate.bind(this));
    this.robot.userData.ik();
    this.robot.userData.fk();
  }
  changeTransformMode(e) {
    this.world.transformControls.setMode(e.name);
    e.isActive = true;
    for (const i of this.transformMode) {
      if (i !== e) {
        i.isActive = false;
      }
    }
  }
  changeTool(e){
    if ( e.name === this.curPanel){
      // this.router.navigate([`/world/animation}`]);
      this.curPanel = null;
    }else{
      this.curPanel = e.name;
      this.router.navigate([`/world/animation/${e.name}`]);
    }

  }
  public trigger(){

  }
  public deploy(){
    this.subs.forEach(s => s.unsubscribe());
    const node = [1, 3, 2, 4, 5, 6];
    const link = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 2]];
    const nodeMap: Map<number, Subject<void>> = new Map();
    const linkMap: Map<number, Subject<void>[]> = new Map();
    node.forEach(n => {
      nodeMap.set( n , new Subject());
      linkMap.set( n, []);
    });
    link.forEach(l => {
      const nexts = linkMap.get(l[0]);
      const next = nodeMap.get(l[1]);
      linkMap.set(l[0], [...nexts, next]);
    });
    this.subs = [];
    nodeMap.forEach((subject, n) => {
      this.subs.push(subject.subscribe(async () => {
          setTimeout(() => {
            const subjects = linkMap.get(n);
            if ( n === 3){
              subjects[0].next();
              return;
            }
            subjects.forEach(s => {
              s.next();
            });
          }, 2000);

      }));
    });
    const start = nodeMap.get(1);
    start.next();
  }

  setSignal(){
    // this.event.next(1);
  }

}
