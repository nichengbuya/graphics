import { HttpClient } from '@angular/common/http';
import { Host, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
const HOST = 'http://localhost:3000';
const GET_DEVICE_TYPE = '/device/getdevicetype';
const GET_DEVICE_LIST = '/device/getdevicelist';
const REGISTER = '/user/register';
const LOGIN = '/user/login'
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }
  getDeviceType(): Observable<any> {
    return this.http.get<any>(HOST + GET_DEVICE_TYPE);
  }
  getDeviceList(type): Observable<any> {
    return this.http.get<any>(HOST + GET_DEVICE_LIST, { params: { type } });
  }
  register(msg) {
    return this.http.post<any>(HOST + REGISTER, msg)
  }
  login(msg) {
    return this.http.post<any>(HOST + LOGIN, msg)
  }
  
}
