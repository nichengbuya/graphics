import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { WorldService } from 'src/app/service/world.service';
import * as THREE from 'three';
import World from '../common/world';
import AnimateCloth from './cloth';

@Component({
  selector: 'app-cloth',
  templateUrl: './cloth.component.html',
  styleUrls: ['./cloth.component.scss']
})
export class ClothComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cloth') div: ElementRef;
  world: AnimateCloth;
  animation: number;

  constructor(
    private worldService: WorldService
  ) { }

  ngOnInit(): void {
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 1, 0);
  }
  ngAfterViewInit(){
    this.initWorld();
  }
  ngOnDestroy() {
    this.world.removeEvent();
    this.world.gui.destroy();
    cancelAnimationFrame(this.animation);
  }

  initWorld() {

    this.world = new AnimateCloth({
      container: this.div.nativeElement,
      listeners: {
        move() {

        },
        click() {

        }
      }
    });
    // this.worldService.setWorld(this.world);
    this.animate();
  }
  animate() {
    this.animation = requestAnimationFrame(this.animate.bind(this));
    this.world.simulate();
    this.world.update();
  }
}
