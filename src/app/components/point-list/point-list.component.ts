import { Component, HostListener, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-point-list',
  templateUrl: './point-list.component.html',
  styleUrls: ['./point-list.component.scss'],
})
export class PointListComponent implements OnInit {
  // @Input() pointList;
  pointList = [
    {
      data: 'aaa',
      id: '1'
    },
    {
      data: 'bbb',
      id: '2'

    },
    {
      data: 'ccc',
      id: '3'

    },
  ];

  constructor() { }

  ngOnInit(): void {
  }
  handleMove(e, p ){
    const {pointList } = this;
    const origin = pointList.indexOf(e.data);
    pointList.splice(origin, 1);
    const target = pointList.indexOf(p);
    pointList.splice(e.top ? target : target + 1, 0, e.data);

  }
}
