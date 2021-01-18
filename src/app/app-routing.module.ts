import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './view/login/login.component';
import { RegisterComponent } from './view/register/register.component';
import { PropertyComponent } from './components/property/property.component';
import { MotionComponent } from './components/motion/motion.component';
import { LibraryComponent } from './components/library/library.component';
import { AnimationComponent } from './view/animation/animation.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/login' },
  { path: 'login', component: LoginComponent},
  { path: 'register', component: RegisterComponent},
  // { path: 'world', component:WorldComponent }
  { path: 'world', loadChildren: () => import('./view/world/world.module').then(m => m.WorldModule) },
  {
    path: 'project/:id', component: AnimationComponent, 
    children: [
      { path: '' , redirectTo: 'property', pathMatch: 'full' },
      { path: 'property', component: PropertyComponent },
      { path: 'motion', component: MotionComponent},
      { path: 'library', component: LibraryComponent}
      
    ]
  },
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
