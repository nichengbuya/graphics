import { Object3D, Vector3 } from 'three';
import { WorldService } from '../world/world.service';
export class DetachCommand{
  type: string;
  oldPosition: Vector3;
  child: Object3D;
  parent: Object3D;
  name: string;
  constructor(
    private worldService: WorldService,
    oldPosition,
    child,
    parent
  ) {
    this.type = 'DetachCommand';
    this.oldPosition = oldPosition;
    this.child = child;
    this.parent = parent;
    if ( child !== undefined ) {
      this.name = 'Detach';
    }
  }
  execute(){
    this.worldService.detach(this.child);
    this.child.position.copy(this.oldPosition);
  }
  undo(){
    this.worldService.attach(this.child, this.parent);
  }
}
