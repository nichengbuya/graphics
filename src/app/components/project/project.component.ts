import { Component, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/service/project/project.service';
import { uuid } from 'src/app/common/utils';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
export interface Project{
  name:string,
  img:string, 
  description:string,
  _id:string
}
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public projects:Array<Project> = [];
  isCollapsed = false;
  tplModalButtonLoading: boolean;
  tplModal?: NzModalRef;
  projectName:String;
  constructor( 
    private router:Router,
    private projectService:ProjectService,
    private modal: NzModalService, 
    private viewContainerRef: ViewContainerRef
  ) { 
  }

  ngOnInit(): void {
    this.getAllProject();
  }
  createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>): void {
    this.tplModal = this.modal.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzComponentParams: {
        value: 'Template Context'
      },
      nzOnOk: () => console.log('Click ok')
    });
  }

  public async destroyTplModal() {
    this.tplModalButtonLoading = true;
    const res = await  this.projectService.createProject({
      name:this.projectName
    }).toPromise();
    this.tplModal.destroy();
    this.tplModalButtonLoading = false;
    await this.getAllProject();
    this.gotoItem(res.data._id)
  }
  public async deleteProject(id,$event){
    console.log(id)
    $event.preventDefault();
    $event.stopPropagation();
    await this.projectService.deleteProject({
      id:id
    }).toPromise();
    await this.getAllProject();
  }
  public async getAllProject(){
    let res  = await this.projectService.getAllProject().toPromise();
    this.projects = res.data;
  }
  public gotoItem(id){
    this.router.navigate(['/project/',id]);
  }
}
