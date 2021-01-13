import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HOST } from 'src/app/common/utils';

const GET_ALL_PROJECT='/project/getAllProject';
const UPDATE_PROJECT='/project/updateProject';
const CREATE_PROJECT='/project/createProject';
const DELETE_PROJECT='/project/deleteProject';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http:HttpClient
  ) { }
  getAllProject(): Observable<any>{
    return this.http.get<any>(HOST + GET_ALL_PROJECT)
  }
  updateProject(msg): Observable<any>{
    return this.http.post(HOST + UPDATE_PROJECT,msg)
  }
  createProject(msg:any): Observable<any>{
    return this.http.post(HOST + CREATE_PROJECT,msg)
  }
  deleteProject(msg):Observable<any>{
    return this.http.delete(HOST + DELETE_PROJECT,msg)
  }

}
