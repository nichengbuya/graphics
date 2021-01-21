import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';
import { AddObjectCommand } from 'src/app/service/command/add-object-command';
import { CommandService } from 'src/app/service/command/command.service';
import { EventEmitService } from 'src/app/service/event/event-emit.service';
import { HttpService } from 'src/app/service/http/http.service';
import { Device, WorldService } from 'src/app/service/world/world.service';
import { Object3D, Vector3 } from 'three';

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
    private eventEmitService: EventEmitService,
    private commandService: CommandService
    ) { }

  ngOnInit(): void {
    this.initData();
    // this.subs.push(this.eventEmitService.emitClick.subscribe(e => {
    //   if (this.moveSub){
    //     this.moveSub.unsubscribe();
    //   }
    // }));
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
    await this.getDeviceList(this.deviceType);
  }
  public async getDeviceList(type){
    const devices = await this.configService.getDeviceList(type).toPromise();
    this.listOfDevices = devices.data.map((device) => {
      return {
        name: device.name,
        url: device.url ,
        img: this.sanitizer.bypassSecurityTrustResourceUrl(device.img) ,
        type: device.type,
        attach: device.attach,
        joints: device.joints?device.joints:[],
        id: device._id
      };
    });
  }
  public async addDevice(item: Device){
    this.device = null;
    this.device = await this.worldService.initObject(item);
    this.worldService.addObject(this.device);
  }
  public changePosition(device: Object3D, position: Vector3){
    if (device){
      device.position.copy(position);
    }

  }
  dragStart(e:DragEvent,device){
    e.dataTransfer.setData('device',JSON.stringify(device));
  }

}
