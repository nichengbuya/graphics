import { Component, OnDestroy, OnInit } from '@angular/core';
import Shader from './shader';

@Component({
  selector: 'app-shader',
  templateUrl: './shader.component.html',
  styleUrls: ['./shader.component.scss']
})
export class ShaderComponent implements OnInit, OnDestroy {
  world: Shader;
  constructor() { }

  ngOnInit(): void {
    this.world = new Shader();
  }
  ngOnDestroy(){
    this.world.destroy();
  }
}
