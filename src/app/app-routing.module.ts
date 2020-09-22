import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HeroDetailComponent } from './components/hero-detail/hero-detail.component';
import { HeroesComponent } from './view/heroes/heroes.component';
import { DashboardComponent } from './view/dashboard/dashboard.component';
import { FormComponent } from './view/form/form.component';
import { ObservableComponent } from './view/observable/observable.component';
import { WorldComponent } from './view/world/world.component';



const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'heroes', component: HeroesComponent },
  { path: 'detail/:id', component: HeroDetailComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'form', component: FormComponent},
  { path: 'observable', component: ObservableComponent },
  { path: 'world', component: WorldComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
