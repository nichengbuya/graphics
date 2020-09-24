import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorldComponent } from './view/world/world.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./view/welcome/welcome.module').then(m => m.WelcomeModule) },
  // { path: 'world', component:WorldComponent }
  { path: 'world', loadChildren: () => import('./view/world/world.module').then(m => m.WelcomeModule) }
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
