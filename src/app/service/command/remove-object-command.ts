import { Object3D } from 'three';
import { WorldService } from '../world/world.service';
export class RemoveObjectCommand{
  type: string;
  object: Object3D;
  name: string;
  constructor(
    private worldService: WorldService,
    object
  ) {
    this.type = 'RemoveObjectCommand';

    this.object = object;
    if ( object !== undefined ) {
      this.name = 'Remove Object: ' + object.name;
    }
  }
  execute(){
    this.worldService.removeObject(this.object);
  }
  undo(){
    this.worldService.addObject(this.object);
  }
}
