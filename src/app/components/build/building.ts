import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';

class Building{
    floors = new Array();
    floorsGap = .5;
    constructor(){
    }
    expendFloors(){
        this.floors.reduce((offset, controller) => {
            new TWEEN.Tween(controller.position)
                .to({ y: offset }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            return offset += this.floorsGap;
        }, 0);
    }
    unExpendFloors(){

    }
}
export default Building;
