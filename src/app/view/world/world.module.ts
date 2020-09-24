import { NgModule } from '@angular/core';
import { WorldComponent } from './world.component';
import {WorldRoutingModule} from './world-routing.module';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { AnimationComponent } from 'src/app/components/animation/animation.component';
import { CommonModule } from '@angular/common';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';


@NgModule({
  imports: [
    CommonModule,
    WorldRoutingModule
  ],
  declarations: [
      WorldComponent,
      ClothComponent,
      ShaderComponent,
      AnimationComponent,
      LoadBarComponent
    ],
  exports: [WorldComponent]
})
export class WelcomeModule { }
