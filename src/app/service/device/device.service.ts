import { HttpClient } from '@angular/common/http';
import { Host, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HOST } from 'src/app/common/utils';

const GET_DEVICE_TYPE = '/device/getdevicetype';
const GET_DEVICE_LIST = '/device/getdevicelist';
const GET_DEVICE = '/device/getDevice';
@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) { }
  getDeviceType(): Observable<any> {
    return this.http.get<any>(HOST + GET_DEVICE_TYPE);
  }
  
  getDeviceList(type): Observable<any> {
    return this.http.get<any>(HOST + GET_DEVICE_LIST, { params: { type } });
  }
  getDevice(id): Observable<any>{
    return this.http.get<any>(HOST + GET_DEVICE, { params: { id } });
  }
}