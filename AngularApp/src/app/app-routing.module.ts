import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './app-common/components/login/login.component';
import { ContentLayoutComponent } from './app-layout/components/content-layout/content-layout.component';

const appRoutes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  // { path: 'app', redirectTo: 'app/project/home/all' },
  { path: '', component: ContentLayoutComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only 
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
