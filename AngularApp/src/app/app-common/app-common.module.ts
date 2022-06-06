import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './components/home/home.component';
import { AppCommonRoutingModule } from './app-common-routing.module';
import { LeftPanelComponent } from './components/left-panel/left-panel.component';
import { MiddlePanelComponent } from './components/middle-panel/middle-panel.component';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { IconDefinition } from '@ant-design/icons-angular';
import { NgZorroAntdModule, NZ_ICON_DEFAULT_TWOTONE_COLOR, NZ_ICONS } from 'ng-zorro-antd';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { CookieService } from 'ngx-cookie-service';
import { BpsComponentsLibModule } from 'bps-components-lib';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { HomeExpandablePanelComponent } from './components/home-expandable-panel/home-expandable-panel.component';
import { ContactTableComponent } from './components/contact-table/contact-table.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { MigrationComponent } from './components/migration/migration.component';
import { CheckPermissionsDirective } from './directive/check-permissions.directive';
import { FaqComponent } from './components/faq/faq.component';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map(key => antDesignIcons[key]);

@NgModule({
  declarations: [
    LoginComponent,
    HomeComponent,
    HomeExpandablePanelComponent,
    LeftPanelComponent,
    MiddlePanelComponent,
    ContactTableComponent,
    AutocompleteComponent,
    MigrationComponent,
    FaqComponent,
    CheckPermissionsDirective
  ],
  imports: [
    CommonModule,
    AppCommonRoutingModule,
    FormsModule,
    NgZorroAntdModule,
    NzDropDownModule,
    NzAutocompleteModule,
    BpsComponentsLibModule,
    ReactiveFormsModule,
    TranslateModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  bootstrap: [
    LoginComponent,
    HomeComponent,
    LeftPanelComponent,
    MiddlePanelComponent
  ],
  providers: [
    { provide: NZ_ICON_DEFAULT_TWOTONE_COLOR, useValue: '#ffffff' }, // If not provided, Ant Design's official blue would be used
    { provide: NZ_ICONS, useValue: icons },
    CookieService
  ],
  exports:[CheckPermissionsDirective]
})
export class AppCommonModule { }
