import { Component, OnInit } from '@angular/core';
import { tween } from '../common/tween';
interface LoadBar {
  isLoad: boolean;
  percent: number;
}
@Component({
  selector: 'app-load-bar',
  templateUrl: './load-bar.component.html',
  styleUrls: ['./load-bar.component.scss']
})
export class LoadBarComponent implements OnInit {
  public loadBar: LoadBar = {
    isLoad: false,
    percent: 0
  };
  constructor() { }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.initLoadBar();
    // }, 0);

  }
  public complete(){
    this.loadBar.isLoad = true;
    tween(
      {
        from: {
          percent: this.loadBar.percent
        },
        to: {
          percent: 100
        },
        duration: 1000,
      },
      ({ percent }) => {
        this.loadBar.percent = percent;
      },
      () => { }
    );
  }
  public initLoadBar() {
    this.loadBar.isLoad = false;
    this.loadBar.percent = 0;
    const fromData = {
      percent: 0
    };
    const toData = {
      percent: 80
    };
    const pre = tween(
      {
        from: fromData,
        to: toData,
        duration: 2000,
      },
      ({ percent }) => {
        if (!this.loadBar.isLoad) {
          this.loadBar.percent = percent;
        } else {
          pre.stop();
        }
      },
      () => {

      }
    );
  }
}
