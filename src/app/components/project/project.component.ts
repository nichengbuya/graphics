import { Component, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from 'src/app/service/project/project.service';
import { HOST, uuid } from 'src/app/common/utils';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { DomSanitizer } from '@angular/platform-browser';
export interface Project{
  name: string;
  img: string;
  description: string;
  _id: string;
}
@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  public projects: Array<Project> = [];
  isCollapsed = false;
  tplModalButtonLoading: boolean;
  tplModal?: NzModalRef;
  projectName: String;
  confirmModal: NzModalRef<unknown, any>;
  constructor(
    private router: Router,
    private projectService: ProjectService,
    private modal: NzModalService,
    private viewContainerRef: ViewContainerRef,
    private sanitizer: DomSanitizer
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
      }
    });
  }
  createConfirmModal(id, e){
    e.preventDefault();
    e.stopPropagation();
    this.confirmModal = this.modal.confirm({
      nzTitle: 'Do you Want to delete these items?',
      nzOnOk: async () => {
        await this.deleteProject(id);
      }

    });
  }

  public async destroyTplModal() {
    this.tplModalButtonLoading = true;
    const res = await  this.projectService.createProject({
      name: this.projectName,
      img: `${this.projectName}`
    }).toPromise();
    this.tplModal.destroy();
    this.tplModalButtonLoading = false;
    await this.getAllProject();
    this.gotoItem(res.data._id);
  }

  public async deleteProject(id){

    await this.projectService.deleteProject({
      id
    }).toPromise();
    await this.getAllProject();
  }

  public async getAllProject(){
    const res  = await this.projectService.getAllProject().toPromise();
    res.data.forEach( p => {
      // p.img = this.sanitizer.bypassSecurityTrustResourceUrl(p.img)
      p.img = `${HOST}/${p.img}`;
    });
    this.projects = res.data;
  }

  public gotoItem(id){
    this.router.navigate(['/project/', id]);
  }
}
