import { Object3D, Vector3 } from 'three';
import { WorldService } from '../world/world.service';
export class SetPositionCommand {
    type: string;
    object: Object3D;
    name: string;
    newPosition: Vector3;
    oldPosition: Vector3;
    constructor(
        object,
        newPosition,
        oldPosition

    ) {
        this.type = 'SetPositionCommand';

        this.object = object;
        if (object !== undefined) {
            this.name = 'Set Position: ' + object.name;
        }
        if ( object !== undefined && newPosition !== undefined ) {

            this.oldPosition = object.position.clone();
            this.newPosition = newPosition.clone();
        }

        if ( oldPosition !== undefined ) {

            this.oldPosition = oldPosition.clone();
        }
    }

    execute() {
        this.object.position.copy(this.newPosition);
        this.object.updateMatrixWorld(true);

    }

    undo() {
        this.object.position.copy(this.oldPosition);
        this.object.updateMatrixWorld(true);

    }

}
