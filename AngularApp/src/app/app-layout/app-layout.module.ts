import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLayoutComponent } from './components/content-layout/content-layout.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { NavLayoutComponent } from './components/nav-layout/nav-layout.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzDropDownModule } from 'ng-zorro-antd';
import {TranslateModule} from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgZorroAntdModule, NZ_I18N, en_US } from 'ng-zorro-antd';
import {BpsComponentsLibModule} from 'bps-components-lib';
import { AppCommonModule } from '../app-common/app-common.module';

@NgModule({
  declarations: [ContentLayoutComponent, MainLayoutComponent, NavLayoutComponent],
  imports: [
    CommonModule,
    RouterModule,
    BrowserAnimationsModule,
    NzIconModule,
    NzLayoutModule,
    NzDropDownModule,
    TranslateModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgZorroAntdModule,
    BpsComponentsLibModule,
    AppCommonModule
],
bootstrap: [ContentLayoutComponent, MainLayoutComponent, NavLayoutComponent],
exports: [
    MainLayoutComponent,
    NavLayoutComponent,
    ContentLayoutComponent
]
})
export class AppLayoutModule { }
