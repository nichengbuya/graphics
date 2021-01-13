import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnInit {
  isCollapsed:boolean = false;
  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

}
