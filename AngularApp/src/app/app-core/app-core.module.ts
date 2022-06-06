import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { httpInterceptorProviders } from './http-interceptors';
import { WindowRefService } from './services/window-ref.service';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    httpInterceptorProviders,
    WindowRefService
  ]
})
export class AppCoreModule { }
