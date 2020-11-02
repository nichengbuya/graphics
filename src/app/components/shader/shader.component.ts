import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorldService } from 'src/app/service/world/world.service';
import Shader from './shader';

@Component({
  selector: 'app-shader',
  templateUrl: './shader.component.html',
  styleUrls: ['./shader.component.scss']
})
export class ShaderComponent implements OnInit, OnDestroy, AfterViewInit {
  world: Shader;
  @ViewChild('shader') div: ElementRef;
  constructor(
    private worldService: WorldService
  ) { }

  ngOnInit(): void {

  }
  ngAfterViewInit() {
    this.world = new Shader({
      container: this.div.nativeElement
    });
    this.worldService.setWorld(this.world);
  }
  ngOnDestroy() {
    this.world.destroy();
  }
}
