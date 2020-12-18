import { NgModule } from '@angular/core';
import { WorldComponent } from './world.component';
import {WorldRoutingModule} from './world-routing.module';
import { ClothComponent } from 'src/app/components/cloth/cloth.component';
import { ShaderComponent } from 'src/app/components/shader/shader.component';
import { CommonModule } from '@angular/common';
import { LoadBarComponent } from 'src/app/components/load-bar/load-bar.component';
import { BuildComponent } from 'src/app/components/build/build.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { LoggerComponent } from 'src/app/components/logger/logger.component';

import { TreeComponent } from 'src/app/components/tree/tree.component';
import { PointListComponent } from 'src/app/components/point-list/point-list.component';
import { DirectiveModule } from 'src/app/directive/directive.module';
import { AnimationComponent } from './animation/animation.component';

import { ResizableModule } from 'angular-resizable-element';
import { LibraryComponent } from 'src/app/components/library/library.component';
import { PropertyComponent } from 'src/app/components/property/property.component';
import { MotionComponent } from 'src/app/components/motion/motion.component';
import { ProjectComponent } from 'src/app/components/project/project.component';

import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    WorldRoutingModule,
    NgZorroAntdModule,
    FormsModule,
    DirectiveModule,
    ResizableModule,
    DragDropModule
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
      MotionComponent,
      PointListComponent,
      ProjectComponent
    ],
  exports: [WorldComponent]
})
export class WorldModule { }
