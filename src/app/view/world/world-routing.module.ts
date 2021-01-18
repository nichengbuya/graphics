import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildComponent } from 'src/app/components/build/build.component';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';

import { WorldComponent } from './world.component';
import { ProjectComponent } from 'src/app/components/project/project.component';

const routes: Routes = [
  {
    path: '', component: WorldComponent, children: [
      {path:'',pathMatch:'full', redirectTo:'projects'},
      {path:'projects',component: ProjectComponent},
      {path: 'shader', component: ShaderComponent},
      { path: 'build', component: BuildComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorldRoutingModule { }
