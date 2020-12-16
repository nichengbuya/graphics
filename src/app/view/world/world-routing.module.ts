import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuildComponent } from 'src/app/components/build/build.component';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { AnimationComponent } from './animation/animation.component';
import { LibraryComponent } from './library/library.component';
import { MotionComponent } from './motion/motion.component';
import { ProjectComponent } from './project/project.component';
import { PropertyComponent } from './property/property.component';
import { WorldComponent } from './world.component';

const routes: Routes = [
  {
    path: '', component: WorldComponent, children: [
      {path:'',pathMatch:'full', redirectTo:'project'},
      {path:'project',component: ProjectComponent},
      { path: 'cloth', component: ClothComponent },
      { path: 'shader', component: ShaderComponent },
      {
        path: 'animation', component: AnimationComponent, 
        children: [
          { path: '' , redirectTo: 'property', pathMatch: 'full' },
          { path: 'property', component: PropertyComponent },
          { path: 'motion', component: MotionComponent}
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
