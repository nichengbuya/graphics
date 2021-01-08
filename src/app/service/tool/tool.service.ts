import { Injectable } from '@angular/core';
import { Object3D, Camera, BufferGeometry, Geometry } from 'three';
@Injectable({
  providedIn: 'root'
})
export class ToolService {

  constructor() { }

  traverse(obj, callback) {
    const stack = [obj];
    while (stack.length) {
      const currObj = stack.pop();
      callback(currObj);
      if (currObj.children.length) {
        stack.push(...currObj.children);
      }
    }
  }

  hasAncestorWithName(obj, ancestorName: RegExp) {
    let matched: boolean;
    while (obj.parent && !matched) {
      matched = ancestorName.test(obj.parent.name);
      obj = obj.parent;
    }
    return matched;
  }

  findAncestorLike(obj, ancestorName: RegExp) {
    let res: any;
    while (obj.parent && !res) {
      if (ancestorName.test(obj.parent.name)) {
        res = obj.parent;
      }
      obj = obj.parent;
    }
    return res;
  }

  floorIdxFromFloorCtllerName(name: string) {
    return Number(name.replace(/floor-([0-9]+)-controller/g, '$1')) - 1;
  }

  calcScreenCoord(obj: Object3D, camera: Camera, dom: HTMLCanvasElement) {
    const vec = obj.getWorldPosition(obj.position.clone());
    vec.project(camera);
    return {
      x: Math.round((.5 + vec.x / 2) * dom.width),
      y: Math.round((.5 - vec.y / 2) * dom.height),
    };
  }

  geoFromBufferGeo(geo: BufferGeometry) {
    return new Geometry().fromBufferGeometry(geo);
  }

  disposeAllGeos(obj: Object3D) {
    this.traverse(obj, (child) => {
      if (child.isMesh) {
        child.geometry.dispose();
      }
    });
  }

}
