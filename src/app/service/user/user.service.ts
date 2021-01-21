import { HttpClient } from '@angular/common/http';
import { Host, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { HOST } from 'src/app/common/utils';


const REGISTER = '/user/register';
const LOGIN = '/user/login'
@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }
  register(msg) {
    return this.http.post<any>(HOST + REGISTER, msg)
  }
  
  login(msg) {
    return this.http.post<any>(HOST + LOGIN, msg)
  }
  
}