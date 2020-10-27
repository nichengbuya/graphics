import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConfigService } from 'src/app/service/config.service';
import { WorldService } from 'src/app/service/world.service';
interface Device{
  img: string; name: string; url: string ;
}
@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  listOfDeviceType: Array<{ label: string; value: string }>;
  listOfDevices: Array<Device>;
  deviceType: string;
  constructor(
    private configService: ConfigService,
    private worldService: WorldService,
    private sanitizer: DomSanitizer
    ) { }

  ngOnInit(): void {
    this.initData();
  }
  private async initData() {
    const res = await this.configService.getDeviceType().toPromise();
    this.listOfDeviceType = res.data.map(type => {
      return { label: type.value, value: type.id };
    });
    this.deviceType = this.listOfDeviceType[0].value;
    const devices = await this.configService.getDeviceList(this.deviceType).toPromise();
    this.listOfDevices = devices.data.map((device: Device) => {
      return { name: device.name, url: device.url , img: this.sanitizer.bypassSecurityTrustResourceUrl(device.img)};
    });
  }
  public async addDevice(item: Device){
    // this.load.initLoadBar();
    const device = await this.worldService.initRobot(item.url);
    // this.load.loaded();
    this.worldService.add(device);
  }
}
