import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildComponent } from 'src/app/components/build/build.component';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { AnimationComponent } from './animation/animation.component';

import { WorldComponent } from './world.component';
import { ProjectComponent } from 'src/app/components/project/project.component';
import { PropertyComponent } from 'src/app/components/property/property.component';
import { MotionComponent } from 'src/app/components/motion/motion.component';
import { LibraryComponent } from 'src/app/components/library/library.component';

const routes: Routes = [
  {
    path: '', component: WorldComponent, children: [
      {path:'',pathMatch:'full', redirectTo:'projects'},
      {path:'projects',component: ProjectComponent},
      {
        path: 'project/:id', component: AnimationComponent, 
        children: [
          { path: '' , redirectTo: 'property', pathMatch: 'full' },
          { path: 'property', component: PropertyComponent },
          { path: 'motion', component: MotionComponent},
          { path: 'library', component: LibraryComponent}
          
        ]
      },
      { path: 'build', component: BuildComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorldRoutingModule { }
