import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { WorldService } from 'src/app/service/world/world.service';

@Component({
  selector: 'app-teaching',
  templateUrl: './teaching.component.html',
  styleUrls: ['./teaching.component.scss']
})
export class TeachingComponent implements OnInit {
  @Input() curObj;
  controlArr = [
    {},
    {
      button: true,
      key: 'positiveX'
    },
    {},
    {},
    {
      button: true,
      key: 'positiveZ'
    },
    {
      button: true,
      key: 'positiveY'
    },
    {},
    {
      button: true,
      key: 'negativeY'
    },
    {},
    {},
    {},
    {
      button: true,
      key: 'negativeX'
    },
    {},
    {},
    {
      button: true,
      key: 'negativeZ'
    }
  ];
  effector: any;
  id;

  constructor(
    private worldservice: WorldService
  ) { }

  ngOnInit(): void {
    this.effector = this.curObj?.userData.effector;
  }
  ngOnChanges(changes: SimpleChanges) {
    this.effector = changes.curObj.currentValue?.userData.effector;

  }
  leadThrough(e) {
    if (!this.curObj) {
      return
    }
    this.id = setInterval(()=> {
      switch (e.key) {
        case 'positiveX': {
          this.effector.position.x += 0.01;
          break
        }
        case 'positiveY': {
          this.effector.position.y += 0.01;
          break
        }
        case 'positiveZ': {
          this.effector.position.z += 0.01;
          break
        }
        case 'negativeX': {
          this.effector.position.x -= 0.01;
          break
        }
        case 'negativeY': {
          this.effector.position.y -= 0.01;
          break
        }
        case 'negativeZ': {
          this.effector.position.z -= 0.01;
          break
        }
      }
    }, 20);

  }
  stop(){
    clearInterval(this.id)
    this.curObj.userData.fk();
  }
}
