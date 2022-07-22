import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { ConfigureComponent } from './components/project/configure/configure.component';
import { LeftConfigureComponent } from './components/project/left-configure/left-configure.component';
import { RightConfigureComponent } from './components/project/right-configure/right-configure.component';
import { OperabilityComponent } from './components/project/operability/operability.component';
import { GlassPanelComponent } from './components/project/glass-panel/glass-panel.component';
import { IframeWrapperComponent } from './components/project/iframe-wrapper/iframe-wrapper.component';
import { FramingComponent } from './components/project/framing/framing.component';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StructuralComponent } from './components/project/structural/structural.component';
import { FramingCustomComponent } from './components/project/framing-custom/framing-custom.component';

import { BpsComponentsLibModule } from 'bps-components-lib';
import { OuterTableComponent } from './components/project/side-panels/outer-table/outer-table.component';
import { VentTableComponent } from './components/project/side-panels/vent-table/vent-table.component';
import { MullionTableComponent } from './components/project/side-panels/mullion-table/mullion-table.component';
import { ThermalComponent } from './components/project/thermal/thermal.component';
import { ResultGeneralComponent } from './components/result/result-general/result-general.component';
import { AppStructuralRoutingModule } from './app-structural-routing.module';
import { LeftResultComponent } from './components/result/left-result/left-result.component';
import { LeftStructuralPanelComponent } from './components/result/left-structural-panel/left-structural-panel.component';
import { LeftAcousticPanelComponent } from './components/result/left-acoustic-panel/left-acoustic-panel.component';
import { LeftThermalPanelComponent } from './components/result/left-thermal-panel/left-thermal-panel.component';
import { AcousticComponent } from './components/project/acoustic/acoustic.component';
import { RightResultComponent } from './components/result/right-result/right-result.component';
import { AcousticPerformanceComponent } from './components/result/acoustic-performance/acoustic-performance.component';
import { GlassPanelTableComponent } from './components/project/side-panels/glass-panel-table/glass-panel-table.component';
import { ReportGeneralComponent } from './components/report/report-general/report-general.component';
import { LeftReportComponent } from './components/report/left-report/left-report.component';
import { RightReportComponent } from './components/report/right-report/right-report.component';
import { TranslateModule } from '@ngx-translate/core';
import { ViewerInfillComponent } from './components/project/viewer-infill/viewer-infill.component';
import { StructuralTableComponent } from './components/project/side-panels/structural-table/structural-table.component';
import { SpacerTypeComponent } from './components/project/spacer-type/spacer-type.component';
import { ResizableModule } from 'angular-resizable-element';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import { MullionDepthTableComponent } from './components/project/mullion-depth-table/mullion-depth-table.component';
import { FrameCombinationTableComponent } from './components/project/side-panels/frame-combination-table/frame-combination-table.component';
import { NotificationCustomComponent } from './components/project/notification/notification-custom/notification-custom.component';
import { ModelCustomComponent } from './components/project/notification/model-custom/model-custom.component';
import { TooltipCustomComponent } from './components/project/notification/tooltip-custom/tooltip-custom.component';
import { AcousticChartComponent } from './components/result/acoustic-chart/acoustic-chart.component';
import { OrdersComponent } from './components/project/orders/orders.component';
import { OrderProgressComponent } from './components/project/order-progress/order-progress.component';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { LoadComponent } from './components/project/load/load.component';
import { HandleColorComponent } from './components/project/side-panels/handle-color/handle-color.component';
import { ProfileColorComponent } from './components/project/side-panels/profile-color/profile-color.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { DisclaimerComponent } from './components/project/disclaimer/disclaimer.component';
import { HingeTypeComponent } from './components/project/side-panels/hinge-type/hinge-type.component';
import { InsideHandleComponent } from './components/project/side-panels/inside-handle/inside-handle.component';
import { OutsideHandleComponent } from './components/project/side-panels/outside-handle/outside-handle.component';
import { DoorLeafActiveComponent } from './components/project/side-panels/door-leaf-active/door-leaf-active.component';
import { DoorLeafPassiveComponent } from './components/project/side-panels/door-leaf-passive/door-leaf-passive.component';
import { SillProfileFixedComponent } from './components/project/side-panels/sill-profile-fixed/sill-profile-fixed.component';
import { SillProfileBottomComponent } from './components/project/side-panels/sill-profile-bottom/sill-profile-bottom.component';
import { AppCommonModule } from '../app-common/app-common.module';
import { LibraryCustomComponent } from './components/project/side-panels/library-custom/library-custom.component';
import { SlidingUnitComponent } from './components/project/sliding-unit/sliding-unit.component';
import { InterlockProfileComponent } from './components/project/side-panels/interlock-profile/interlock-profile.component';
import { ReinforcementProfileComponent } from './components/project/side-panels/reinforcement-profile/reinforcement-profile.component';
import { DoubleVentTableComponent } from './components/project/side-panels/double-vent-table/double-vent-table.component';
import { StructuralProfileTableComponent } from './components/project/side-panels/structural-profile-table/structural-profile-table.component';
import { SystemTableComponent } from './components/project/system-table/system-table.component';
export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;

registerLocaleData(localeDe, 'de');
@NgModule({
  declarations: [
    ConfigureComponent,
    LeftConfigureComponent,
    RightConfigureComponent,
    OperabilityComponent,
    GlassPanelComponent,
    IframeWrapperComponent,
    FramingComponent,
    StructuralComponent,
    FramingCustomComponent,
    OuterTableComponent,
    VentTableComponent,
    MullionTableComponent,
    ThermalComponent,
    ResultGeneralComponent,
    LeftResultComponent,
    LeftStructuralPanelComponent,
    LeftAcousticPanelComponent,
    LeftThermalPanelComponent,
    AcousticComponent,
    RightResultComponent,
    AcousticPerformanceComponent,
    GlassPanelTableComponent,
    ReportGeneralComponent,
    LeftReportComponent,
    RightReportComponent,
    ViewerInfillComponent,
    StructuralTableComponent,
    SpacerTypeComponent,
    MullionDepthTableComponent,
    LibraryCustomComponent,
    FrameCombinationTableComponent,
    NotificationCustomComponent,
    ModelCustomComponent,
    TooltipCustomComponent,
    AcousticChartComponent,
    OrderProgressComponent,
    OrdersComponent,
    LoadComponent,
    HandleColorComponent,
    ProfileColorComponent,
    DisclaimerComponent,
    HingeTypeComponent,
    InsideHandleComponent,
    OutsideHandleComponent,
    DoorLeafActiveComponent,
    DoorLeafPassiveComponent,
    SillProfileFixedComponent,
    SillProfileBottomComponent,
    SlidingUnitComponent,
    InterlockProfileComponent,
    ReinforcementProfileComponent,
    DoubleVentTableComponent,
    StructuralProfileTableComponent,
    SystemTableComponent],
  imports: [
    CommonModule,
    NzGridModule,
    FormsModule,
    NgZorroAntdModule,
    NzDropDownModule,
    BpsComponentsLibModule,
    AppStructuralRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    ResizableModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NzProgressModule,
    NzCardModule,
    AppCommonModule,
    NgxMaskModule.forRoot(),
  ], schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [ConfigureComponent, LeftConfigureComponent, RightConfigureComponent, OperabilityComponent,
    GlassPanelComponent, IframeWrapperComponent, FramingComponent, StructuralComponent,
    FramingCustomComponent, OuterTableComponent, VentTableComponent, MullionTableComponent, ThermalComponent,
    ResultGeneralComponent, LeftResultComponent, LeftStructuralPanelComponent,
    LeftAcousticPanelComponent, LeftThermalPanelComponent, AcousticComponent, RightResultComponent,
    AcousticPerformanceComponent, GlassPanelTableComponent, ReportGeneralComponent,
    OrderProgressComponent,
    LeftReportComponent, RightReportComponent, ViewerInfillComponent, StructuralTableComponent, SpacerTypeComponent, OrdersComponent]
})
export class AppStructuralModule { }
