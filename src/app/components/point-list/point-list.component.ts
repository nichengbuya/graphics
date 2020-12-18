import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { WorldService } from 'src/app/service/world/world.service';
import { Quaternion, Vector3, Mesh } from 'three';
import { PointService } from 'src/app/service/point/point.service';
export interface Point {
  joints: Array<{jointValue:number}>;
  mesh: Mesh;
  isActive: boolean;
}
@Component({
  selector: 'app-point-list',
  templateUrl: './point-list.component.html',
  styleUrls: ['./point-list.component.scss']
})
export class PointListComponent implements OnInit {
  public pointList;
  public editing: boolean = false;

  public allChecked = false;
  public indeterminate = false;
  constructor(
    private worldService: WorldService,
    private pointService: PointService
  ) { }
  ngOnInit() {
    this.pointList = this.pointService.getPointList();
  }
  ngAfterViewInit(): void {
  }

  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.pointList = this.pointList.map(item => {
        return {
          ...item,
          isActive: true
        };
      });
    } else {
      this.pointList = this.pointList.map(item => {
        return {
          ...item,
          isActive: false
        };
      });
    }
  }

  updateSingleChecked(e, point): void {
    point.isActive = e;
    if (this.pointList.every(item => !item.isActive)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.pointList.every(item => item.isActive)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }
  selectPoint(e) {
    this.updateSingleChecked(!e.isActive, e);
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.pointList, event.previousIndex, event.currentIndex)
  }
  public deletePoint() {
    const robot = this.worldService.getCurObj();
    if (!robot || robot.userData.type !== 'robot') {
      return;
    }
    this.pointList = this.pointList.filter(p => {
      p.isActive !== false;
      robot.remove(p.mesh);
    })
    this.pointService.setPointList(this.pointList)
    this.allChecked = false;
  }
  public addPoint() {
    const robot = this.worldService.getCurObj();
    if (!robot || robot.userData.type !== 'robot') {
      return;
    }
    const mesh = this.worldService.initPoint(robot.userData.effector);
    robot.add(mesh);
    const point: Point = {
      mesh: mesh,
      joints: robot.userData.joints.map(j => {
        return { jointValue: j.jointValue }
      }),
      isActive: false
    }
    this.pointList.push(point);
    this.pointService.setPointList(this.pointList);

  }
  edit(point) {

  }
}
