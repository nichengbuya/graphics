import { Observable } from 'rxjs';
import { BoxBufferGeometry, GridHelper, Mesh, MeshBasicMaterial } from 'three';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import World from '../../common/world';
class Build extends World{
    public models: Array<THREE.Object3D>;
    constructor(options){
        super(options);
        this.initbuild();
    }
    initbuild(){
        this.camera.position.set(10 , 10, 10);
        const grip = new GridHelper(20, 10);
        this.scene.add(grip);
    }
    addModel(fileName): Promise<THREE.Object3D>{
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(`assets/libs/gltf/`);
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);
        return new Promise((resolve, reject) => {
            loader.load(`assets/model/${fileName}`, model => {
                resolve(model.scene);
            }, undefined, err => {
                reject(err);
            });
        });
    }
}
export default Build;
