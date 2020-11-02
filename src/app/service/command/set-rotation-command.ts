import { Euler, Object3D, Vector3 } from 'three';
import { WorldService } from '../world/world.service';
export class SetRotationCommand {
    type: string;
    object: Object3D;
    name: string;
    newRotation: Euler;
    oldRotation: Euler;
    constructor(
        object,
        newRotation,
        oldRotation

    ) {
        this.type = 'SetRotationCommand';

        this.object = object;
        if (object !== undefined) {
            this.name = 'Set Rotation: ' + object.name;
        }
        if ( object !== undefined && newRotation !== undefined ) {

            this.oldRotation = object.rotation.clone();
            this.newRotation = newRotation.clone();
        }

        if ( oldRotation !== undefined ) {

            this.oldRotation = oldRotation.clone();
        }
    }

    execute() {
        this.object.rotation.copy(this.newRotation);
        this.object.updateMatrixWorld(true);

    }

    undo() {
        this.object.rotation.copy(this.oldRotation);
        this.object.updateMatrixWorld(true);

    }

}
