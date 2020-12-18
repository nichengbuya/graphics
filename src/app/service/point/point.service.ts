import { Injectable } from '@angular/core';
import { WorldService } from '../world/world.service';
import { Point } from 'src/app/components/point-list/point-list.component';

@Injectable({
  providedIn: 'root'
})
export class PointService {
  pointList:Point[] = [];
  constructor() { }
  getPointList(){
    return this.pointList;
  }
  setPointList(pointList:Point[]){
    this.pointList = pointList
  }
}
