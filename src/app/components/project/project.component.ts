import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
interface ProjectProp{
  name: string;
  description?: string;
  id: string;
  img?: string;
}
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public projects:Array<ProjectProp> = [];
  isCollapsed = false;
  constructor( private router:Router) { }

  ngOnInit(): void {
    for(let i = 0 ;i<100;i++){
      this.projects.push({
        id: `${i}`,
        name:`project${i}`
      })
    }
  }

  public gotoItem(id){
    this.router.navigate(['/world/project/'],{queryParams:{'id':id}});
  }
}
