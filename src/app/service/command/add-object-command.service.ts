import { Injectable } from '@angular/core';
import { executionAsyncResource } from 'async_hooks';
import { Object3D } from 'three';
import { WorldService } from '../world/world.service';

export class AddObjectCommandService {
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
  excute(){
    this.worldService.addObject(this.object)
  }
  undo(){
    this.worldService.removeObject(this.object)
  }
}
