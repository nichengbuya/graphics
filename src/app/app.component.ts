import { Component } from '@angular/core';
import { WorldService } from './service/world.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isCollapsed = false;
  constructor(
    private worldService: WorldService
  ){}
  toggleSlider(){
    this.isCollapsed = !this.isCollapsed;
  }
}
