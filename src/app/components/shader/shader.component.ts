import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorldService } from 'src/app/service/world/world.service';
import * as THREE from 'three';
import { ShaderService } from './shader.service';

@Component({
  selector: 'app-shader',
  templateUrl: './shader.component.html',
  styleUrls: ['./shader.component.scss']
})
export class ShaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('shader') div: ElementRef;
  constructor(
    private shaderService: ShaderService
  ) { }

  ngOnInit(): void {

  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.init();
    }, 0)
  }
  ngOnDestroy() {
    this.shaderService.destroy();
  }
  init() {
    this.shaderService.init(this.div.nativeElement);
  }


}
