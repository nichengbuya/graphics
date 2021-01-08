import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HOST } from 'src/app/common/utils';
export interface Project{
  name: String
}
const GET_ALL_PROJECTS='/project/getAllProject';
const UPDATE_PROJECT='/project/updateProject';
const CREATE_PROJECT='/project/createProject';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(
    private http:HttpClient
  ) { }
  getAllProject(): Observable<Project[]>{
    return this.http.get<any>(HOST + GET_ALL_PROJECTS)
  }
  updateProject(msg): Observable<any>{
    return this.http.post(HOST + UPDATE_PROJECT,msg)
  }
  createProject(msg:Project): Observable<any>{
    return this.http.post(HOST + CREATE_PROJECT,msg)
  }

}
