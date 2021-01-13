import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorldService } from 'src/app/service/world/world.service';
import Shader from './shader';
import * as THREE from 'three';

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
    setTimeout(() =>{
      this.init();
    },0)
  }
  ngOnDestroy() {
    this.worldService.removeEvent();
  }
  init(){
    this.worldService.setWorld(this.div.nativeElement);
    const geometry = new THREE.BoxGeometry( 10, 10, 10 );
    var mat = new THREE.ShaderMaterial({
        uniforms: {},
        // defaultAttributeValues : {},
        vertexShader: `
            varying float flag; 

            void main(){
                float a = 3.141592653589 / 4.0;
                vec3 axis = vec3(1.0,0.0,0.0);
                mat3 rMat= mat3(
                    cos(a), -sin(a), 0.0,
                    sin(a), cos(a), 0.0,
                    0.0, 0.0, 1.0
                );
                flag = dot(vec3(position.x - 5.0,position.yz),rMat * axis);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
        fragmentShader: `
            varying float flag; 

            void main(){
                if(flag > 0.0){
                    discard;
                }
                gl_FragColor = vec4(1.0,1.0,1.0,0.5);
            }
        `,
        transparent: true,
        side:THREE.DoubleSide,
        depthTest:true,
        depthWrite:false,
    });
    const cube = new THREE.Mesh( geometry, mat );
    // cube.position.y = 20;
    this.worldService.addObject( cube );
  }
    
 
}
