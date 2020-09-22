import { Component, OnInit , OnDestroy} from '@angular/core';
import AnimateCloth from './cloth';

@Component({
  selector: 'app-cloth',
  templateUrl: './cloth.component.html',
  styleUrls: ['./cloth.component.scss']
})
export class ClothComponent implements OnInit, OnDestroy {
  world: AnimateCloth;
  animation: number;

  constructor() { }

  ngOnInit(): void {
    this.initWorld();
  }
  ngOnDestroy() {
    this.world.removeEvent();
    this.world.gui.destroy();
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
