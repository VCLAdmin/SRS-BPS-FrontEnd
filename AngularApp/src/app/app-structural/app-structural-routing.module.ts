import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ContentLayoutComponent } from '../app-layout/components/content-layout/content-layout.component';
import { ResultGeneralComponent } from './components/result/result-general/result-general.component';
import { ReportGeneralComponent } from './components/report/report-general/report-general.component';
import { AuthGuard } from '../app-core/guard/auth.guard';
import { Feature } from '../app-core/models/feature';


const appRoutes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  // { path: 'app', redirectTo: 'app/project/home/all' },
  {
    path: '',
    component: ContentLayoutComponent,
    children: [
      {
        path: 'result/:problemGuid',
        canActivate: [AuthGuard],
        data: {feature: Feature.Result},
        component: ResultGeneralComponent
      },
      {
        path: 'report/:problemGuid',
        canActivate: [AuthGuard],
        data: {feature: Feature.Report},
        component: ReportGeneralComponent
      }
    ]
  }
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
export class AppStructuralRoutingModule { }
