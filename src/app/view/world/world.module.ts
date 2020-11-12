import { NgModule } from '@angular/core';
import { WorldComponent } from './world.component';
import {WorldRoutingModule} from './world-routing.module';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { AnimationComponent } from 'src/app/components/animation/animation.component';
import { CommonModule } from '@angular/common';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';
import { BuildComponent } from 'src/app/components/build/build.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { LibraryComponent } from './library/library.component';
import { PropertyComponent } from './property/property.component';
import { LoggerComponent } from 'src/app/components/logger/logger.component';
import { MotionComponent } from './motion/motion.component';
import { TreeComponent } from 'src/app/components/tree/tree.component';


@NgModule({
  imports: [
    CommonModule,
    WorldRoutingModule,
    NgZorroAntdModule,
    FormsModule
  ],
  declarations: [
      WorldComponent,
      ClothComponent,
      ShaderComponent,
      AnimationComponent,
      LoadBarComponent,
      BuildComponent,
      LibraryComponent,
      PropertyComponent,
      LoggerComponent,
      TreeComponent,
      MotionComponent
    ],
  exports: [WorldComponent]
})
export class WorldModule { }
