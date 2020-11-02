import { Object3D } from 'three';
import { WorldService } from '../world/world.service';
export class AddObjectCommand{
  type: string;
  object: Object3D;
  name: string;
  constructor(
    private worldService: WorldService,
    object
  ) {
    this.type = 'AddObjectCommand';

    this.object = object;
    if ( object !== undefined ) {
      this.name = 'Add Object: ' + object.name;
    }
  }
  execute(){
    this.worldService.addObject(this.object);
  }
  undo(){
    this.worldService.removeObject(this.object);
  }
}
