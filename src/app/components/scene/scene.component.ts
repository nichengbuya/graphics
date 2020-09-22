import { Component, OnInit , OnDestroy} from '@angular/core';
import AnimateCloth from './cloth';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements OnInit, OnDestroy {
  world: AnimateCloth;
  animation: number;

  constructor() { }

  ngOnInit(): void {
    this.initWorld();
  }
  ngOnDestroy() {
    this.world.removeEvent();
    cancelAnimationFrame(this.animation)
  }

  initWorld(){
    const div = document.getElementById('container');
    this.world = new AnimateCloth({
      container: div,
      listeners: {
        move(){

        },
        click(){

        }
      }
    });
    // console.log(Date.now())
    this.animate()
  }
  animate(){
    this.animation = requestAnimationFrame(this.animate.bind(this));
    this.world.simulate();
    this.world.update();
  }
}
