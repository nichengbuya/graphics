import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnimationComponent } from 'src/app/components/animation/animation.component';
import { BuildComponent } from 'src/app/components/build/build.component';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { LibraryComponent } from './library/library.component';
import { PropertyComponent } from './property/property.component';
import { WorldComponent } from './world.component';

const routes: Routes = [
  {
    path: '', component: WorldComponent, children: [
      { path: 'cloth', component: ClothComponent },
      { path: 'shader', component: ShaderComponent },
      {
        path: 'animation', component: AnimationComponent, children: [
          { path: 'library', component: LibraryComponent },
          { path: 'property', component: PropertyComponent }
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
