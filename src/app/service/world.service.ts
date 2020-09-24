import { Injectable } from '@angular/core';
import World from '../components/common/world';

interface OriginSize{
  width: number;
  height: number;
}
@Injectable({
  providedIn: 'root'
})
export class WorldService {
  world: World;
  constructor() { }
  setWorld(world){
    this.world  = world;
  }

  resize(){
      // this.world.updateSize();
  }
}
