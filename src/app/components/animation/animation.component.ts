import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { tween } from '../common/tween';
import Animation from './animation';
import URDFRobot from 'urdf-loader';
import { LoadBarComponent } from '../load-bar/load-bar.component';
import * as THREE from 'three';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('animation') div: ElementRef;
  @ViewChild('load') load: LoadBarComponent;
  world: Animation;
  public robotList = [
    {
      name: 'ur5',
      url: 'assets/robot/ur5_description/urdf/ur5.urdf'
    }
  ];

  robot: URDFRobot;
  animation: number;
  constructor() { }

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
  }
  ngAfterViewInit() {
    this.init();
  }
  ngOnDestroy() {
    this.world.removeEvent();
    cancelAnimationFrame(this.animation);
  }
  public async init() {
    this.world = new Animation({
      container: this.div.nativeElement,
      listeners: {
        move() {

        },
        click() {

        }
      }
    });
    const promises = [];
    this.robotList.forEach(async item => {
      this.robot = await this.world.initRobot(item.url);
      promises.push(this.world.initRobot);
    });

    await Promise.all(promises);
    this.load.loaded();
    this.animate();
  }
  animate() {
    this.animation = requestAnimationFrame(this.animate.bind(this));
    this.robot.userData.ik();
    this.robot.userData.fk();
  }
}
