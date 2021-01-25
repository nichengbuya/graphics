import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/service/user/user.service';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['./world.component.scss']
})
export class WorldComponent implements OnInit {
  isCollapsed:boolean = false;
  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit() {
  }
  logout(){
    this.userService.logout();
  }
}
