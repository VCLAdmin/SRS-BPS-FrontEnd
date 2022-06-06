import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ContentLayoutComponent } from '../app-layout/components/content-layout/content-layout.component';
import { HomeComponent } from './components/home/home.component';
import { ConfigureComponent } from '../app-structural/components/project/configure/configure.component';
import { ContactTableComponent } from './components/contact-table/contact-table.component';
import { OrdersComponent } from '../app-structural/components/project/orders/orders.component';
import { MigrationComponent } from './components/migration/migration.component';
import { AuthGuard } from '../app-core/guard/auth.guard';
import { Feature } from '../app-core/models/feature';
import { FaqComponent } from './components/faq/faq.component';

const appRoutes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  // { path: 'app', redirectTo: 'app/project/home/all' },
  { path: 'contactlist', canActivate: [AuthGuard], data: {feature: Feature.ContactList}, component: ContactTableComponent },
  { path: 'migration', canActivate: [AuthGuard], data: {feature: Feature.Migration}, component: MigrationComponent },
  {
    path: '',
    component: ContentLayoutComponent,
    children: [
      {
        path: 'login',
        canActivate: [AuthGuard],
        data: {feature: Feature.Login},
        component: LoginComponent
      },
      {
        path: 'contactlist',
        canActivate: [AuthGuard],
        data: {feature: Feature.ContactList},
        component: ContactTableComponent
      },
      {
        path: 'migration',
        canActivate: [AuthGuard],
        data: {feature: Feature.Migration},
        component: MigrationComponent
      },
      {
        path: 'home',
        canActivate: [AuthGuard],
        data: {feature: Feature.Home},
        component: HomeComponent
      },
      {
        path: 'problemconfigure/:problemGuid',
        canActivate: [AuthGuard],
        data: {feature: Feature.Configure},
        component: ConfigureComponent
      },
      {
        path: 'orders/:problemGuid',
        canActivate: [AuthGuard],
        data: {feature: Feature.MyOrder},
        component: OrdersComponent
      },
      {
        path: 'faqs',
        component: FaqComponent
      }
    ]
  },
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
export class AppCommonRoutingModule { }
