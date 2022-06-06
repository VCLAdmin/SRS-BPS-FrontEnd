import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
//import { CollapsedPanelStatus } from "src/app/app-common/models/bps-unified-model";
import { ConfigPanelsService } from "./config-panels.service";
//import { IframeService } from "./iframe.service";
import { UnifiedModelService } from "./unified-model.service";

@Injectable({
  providedIn: "root",
})
export class ValidatePanelsService {
  constructor(
    // private ifService: IframeService,
    // private cpService: ConfigPanelsService,
    // private umService: UnifiedModelService
  ) { }

  // private bsujValidatePanel: Subject<any> = new Subject<any>();
  // obsValidatePanel = this.bsujValidatePanel.asObservable();
  // setValidatePanel(isValid: boolean, moduleName: string) {
  //   this.bsujValidatePanel.next({ isValid: isValid, moduleName: moduleName });
  // }

  isValidNumber_Positive(value: any): boolean {
    if (!value) return false;
    if (isNaN(value)) return false;
    if (value <= 0) return false;
    return true;
  }

  isValidNumber_Negative(value: any): boolean {
    if (!value) return false;
    if (isNaN(value)) return false;
    if (value >= 0) return false;
    return true;
  }

  // validatePanel(_event: any, panel: string) {
  //   this.cpService.closeAllPopouts();
  //   this.collapseAllPanels(panel);
  //   setTimeout(() => {
  //     switch (panel) {
  //       case 'Operability':
  //         this.panelOperabilityValid = true;
  //         break;
  //       case 'GlassPanel':
  //         if (this.glassPanelComponent) {
  //           this.panelGlassPanelValid = this.glassPanelComponent.isValid();
  //           if (!this.isGlassPanelActive && !_event) {
  //             if (this.umService.current_UnifiedModel.ProblemSetting.EnableAcoustic) {
  //               this.isAcousticGlassFormValid();
  //             }
  //             if (this.umService.current_UnifiedModel.ProblemSetting.EnableThermal) {
  //               this.isThermalGlassFormValid();
  //             }
  //           }
  //         }
  //         break;
  //       case 'Framing':
  //         this.panelFramingValid = true;
  //         break;
  //       case 'Load':
  //         this.panelLoadPanelValid = true
  //         break;
  //       case 'Acoustic':
  //         if (this.acousticComponent) {
  //           this.panelAcousticValid = this.acousticComponent.isFormValid();
  //         }
  //         break;
  //       case 'Structural':
  //         if (this.structuralComponent) {
  //           this.isValidStructural = this.structuralComponent.isFormValid();
  //         }
  //         break;
  //       case 'Thermal':
  //         break;
  //     }
  //     this.enableCompute();
  //   });
  // }

  // collapseAllPanels(expand: string, event: boolean) {
  //   if (!this.umService.current_UnifiedModel.CollapsedPanels)
  //     this.umService.current_UnifiedModel.CollapsedPanels = new CollapsedPanelStatus();
  //   if (expand !== 'Configure') {
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Framing = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Glass = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Operability = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Structural = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Acoustic = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Thermal = false;
  //     this.umService.current_UnifiedModel.CollapsedPanels.Panel_Load = false;
  //   }
  //   this.umService.current_UnifiedModel.CollapsedPanels.Panel_Configure = event;
  //   this.ifService.getDisplaySettings_Accordian(true);
  //   if (expand) {
  //     switch (expand) {
  //       case 'Framing': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Framing = this.isFramingActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = false;
  //         break;
  //       }
  //       case 'GlassPanel': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Glass = this.isGlassPanelActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = false;
  //         break;
  //       }
  //       case 'Operability': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Operability = this.isOperabilityActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = false;
  //         break;
  //       }
  //       case 'Structural': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Structural = this.isStructuralActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = true;
  //         break;
  //       }
  //       case 'Acoustic': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Acoustic = this.isAcousticActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = false;
  //         break;
  //       }
  //       case 'Thermal': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Thermal = this.isThermalActive;
  //         if (this.umService.current_UnifiedModel.ModelInput && this.umService.current_UnifiedModel.ModelInput.Structural)
  //           this.umService.current_UnifiedModel.ModelInput.Structural.ShowBoundaryCondition = false;
  //         break;
  //       }
  //       case 'Load': {
  //         this.umService.current_UnifiedModel.CollapsedPanels.Panel_Load = this.isLoadActive;
  //         break;
  //       }
  //     }
  //   }
  // }

}
