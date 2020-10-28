import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';
import { EventEmitService } from 'src/app/service/event-emit.service';
import { HttpService } from 'src/app/service/http.service';
import { WorldService } from 'src/app/service/world.service';
import { Object3D, Vector3 } from 'three';
interface Device{
  img: string; name: string; url: string ;
}
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit , OnDestroy {
  @ViewChild('load') load: LoadBarComponent;
  listOfDeviceType: Array<{ label: string; value: string }>;
  listOfDevices: Array<Device>;
  deviceType: string;
  private subs: Subscription[] = [];
  public device: Object3D;
  moveSub: Subscription;
  constructor(
    private configService: HttpService,
    private worldService: WorldService,
    private sanitizer: DomSanitizer,
    private eventEmitService: EventEmitService
    ) { }

  ngOnInit(): void {
    this.initData();
    this.subs.push(this.eventEmitService.emitClick.subscribe(e => {
      if (this.moveSub){
        this.moveSub.unsubscribe();
      }
    }));
  }
  ngOnDestroy(){
    this.subs.forEach(s => s.unsubscribe());
  }
  private async initData() {
    const res = await this.configService.getDeviceType().toPromise();
    this.listOfDeviceType = res.data.map(type => {
      return { label: type.value, value: type.value };
    });
    this.deviceType = this.listOfDeviceType[0].value;
    await this.getDeviceList(this.deviceType)
    // const devices = await this.configService.getDeviceList(this.deviceType).toPromise();
    // this.listOfDevices = devices.data.map((device: Device) => {
    //   return { name: device.name, url: device.url , img: this.sanitizer.bypassSecurityTrustResourceUrl(device.img)};
    // });
  }
  public async getDeviceList(type){
    // this.deviceType = this.listOfDeviceType[0].value;
    const devices = await this.configService.getDeviceList(type).toPromise();
    this.listOfDevices = devices.data.map((device: Device) => {
      return { name: device.name, url: device.url , img: this.sanitizer.bypassSecurityTrustResourceUrl(device.img)};
    });
  }
  public async addDevice(item: Device){
    this.load.initLoadBar();
    // let {device} = this;
    this.device = null;
    this.device = await this.worldService.initRobot(item.url);
    this.load.complete();
    this.worldService.add(this.device);
    this.moveSub = this.eventEmitService.emitMove.subscribe(e => {
      this.changePosition(this.device, e[0].point);
    });
  }
  public changePosition(device: Object3D, position: Vector3){
    if (device){
      device.position.copy(position);
    }

  }
}