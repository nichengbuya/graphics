import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { WelcomeRoutingModule } from './welcome-routing.module';

import { WelcomeComponent } from './welcome.component';


@NgModule({
  imports: [CommonModule,WelcomeRoutingModule,NgZorroAntdModule],
  declarations: [
    WelcomeComponent,
  ],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
