import { Object3D, Vector3 } from 'three';
import { WorldService } from '../world/world.service';
export class AttachCommand{
  type: string;
  oldPostion: Vector3;
  child: Object3D;
  parent: Object3D;
  name: string;
  constructor(
    private worldService: WorldService,
    oldPosition,
    child,
    parent
  ) {
    this.type = 'AttachCommand';
    this.oldPostion = oldPosition;
    this.child = child;
    this.parent = parent;
    if ( child !== undefined ) {
      this.name = 'Attach';
    }
  }
  execute(){
    this.worldService.attach(this.child, this.parent);
  }
  undo(){
    this.worldService.detach(this.child);
    this.child.position.copy(this.oldPostion);
  }
}
