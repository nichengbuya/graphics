import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
const HOST = 'http://localhost:3000';
const GET_DEVICE_TYPE = '/device/getdevicetype';
const GET_DEVICE_LIST = '/device/getdevicelist';
@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(private http: HttpClient) { }
  getDeviceType(): Observable<any>{
    return this.http.get<any>( HOST + GET_DEVICE_TYPE);
  }
  getDeviceList(id): Observable<any>{
    return this.http.get<any>(HOST + GET_DEVICE_LIST, {params: {id}});
  }
}
