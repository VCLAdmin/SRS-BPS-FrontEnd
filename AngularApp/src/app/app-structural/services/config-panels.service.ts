import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PanelsModule } from '../models/panels/panels.module';

@Injectable({
  providedIn: 'root'
})
export class ConfigPanelsService {

  constructor() { }

  private bsujPopoutOpened: BehaviorSubject<any> = new BehaviorSubject<any>({ isOpened: false, panelsModule: undefined });
  obsPopout = this.bsujPopoutOpened.asObservable();
  setPopout(isOpened: boolean, moduleName: PanelsModule) {
    if (isOpened)
      this.closeAllPopouts();
    this.bsujPopoutOpened.next({ isOpened: isOpened, panelsModule: moduleName });
  }
  closeAllPopouts() {
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.DoorLeafActive });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.DoorLeafPassive });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.FrameCombination });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.HandleColor });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.HingeType });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.InsideHandle });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.IntermediateMullion });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.IntermediateMullionFacade });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.IntermediateTransom });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.IntermediateTransomFacade });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.Mullion });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.MullionFacade });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.OuterFrame });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.OutsideHandle });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.ProfileColor });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.Reinforcement });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.ReinforcementFacade });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.SillProfileBottom });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.SillProfileFixed });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.SpacerType });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.Transom });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.TransomFacade });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.UDCBottomFraming });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.UDCFraming });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.VentFrame });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.WindLoad });

    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.GlassPanel });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.Structural });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.BottomOuterFrameSliding });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.InterlockSliding });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.ReinforcementSliding });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.DoubleVentSliding });
    this.bsujPopoutOpened.next({ isOpened: false, panelsModule: PanelsModule.StrucuralSliding });
  }

  private sujCurrent: Subject<any> = new Subject<any>();
  obsCurrent = this.sujCurrent.asObservable();
  setCurrent(data: any, moduleName: PanelsModule, action: string = 'Current', otherInfo: any = '') {
    setTimeout(() => {
      this.sujCurrent.next({ data: data, panelsModule: moduleName, action: action, otherInfo: otherInfo });
    }, 500);
  }

  private sujConfirm: Subject<any> = new Subject<any>();
  obsConfirm = this.sujConfirm.asObservable();
  setConfirm(data: any, moduleName: PanelsModule, action: string = 'Confirm', otherInfo: any = '') {
    setTimeout(() => {
      this.sujConfirm.next({ data: data, panelsModule: moduleName, action: action, otherInfo: otherInfo });
    }, 500);
  }

  private sujAction: Subject<any> = new Subject<any>();
  obsAction = this.sujAction.asObservable();
  setAction(data: any, moduleName: PanelsModule, action: string = '', otherInfo: any = '') {
    setTimeout(() => {
      this.sujAction.next({ data: data, panelsModule: moduleName, action: action, otherInfo: otherInfo });
    }, 500);
  }

  public currentSystem: SystemData;
  private sujSystem: Subject<any> = new Subject<any>();
  obsSystem = this.sujSystem.asObservable();
  setSystem(data: SystemData, systemFor: string) {
    setTimeout(() => {
      if (data && (!this.currentSystem || this.currentSystem.Description !== data.Description))
        this.currentSystem = data;
      this.sujSystem.next({ data: data, systemFor: systemFor });
    }, 10);
  }
  SystemData(systemType: string): SystemData[] {
    let systemDataList: SystemData[] = [];
    switch (systemType) {
      case "FWS":
        systemDataList.push(new SystemData(0, 'FWS', 35, 'FWS 35 PD.SI', 'FWS 35 PD', 'SI', 'fws_35_pd_si', 'fws_35_pd_si'));
        systemDataList.push(new SystemData(1, 'FWS', 35, 'FWS 35 PD.HI', 'FWS 35 PD', 'HI', 'fws_35_pd_si', 'fws_35_pd_hi'));
        systemDataList.push(new SystemData(2, 'FWS', 50, 'FWS 50.SI', 'FWS 50', 'SI', 'fws_50_si', 'fws_50_si'));
        systemDataList.push(new SystemData(3, 'FWS', 50, 'FWS 50.SI GREEN', 'FWS 50', 'SI GREEN', 'fws_50_si', 'fws_50_si_green'));
        systemDataList.push(new SystemData(4, 'FWS', 50, 'FWS 50.HI', 'FWS 50', 'HI', 'fws_50_si', 'fws_50_hi'));
        systemDataList.push(new SystemData(5, 'FWS', 50, 'FWS 50', 'FWS 50', '', 'fws_50_si', 'fws_50'));
        systemDataList.push(new SystemData(6, 'FWS', 60, 'FWS 60.SI', 'FWS 60', 'SI', 'fws_60_hi', 'fws_60_si'));
        systemDataList.push(new SystemData(7, 'FWS', 60, 'FWS 60.SI GREEN', 'FWS 60', 'SI GREEN', 'fws_60_hi', 'fws_60_si_green'));
        systemDataList.push(new SystemData(8, 'FWS', 60, 'FWS 60.HI', 'FWS 60', 'HI', 'fws_60_hi', 'fws_60_hi'));
        systemDataList.push(new SystemData(9, 'FWS', 60, 'FWS 60', 'FWS 60', '', 'fws_60_hi', 'fws_60'));
        break;
      case "UDC":
        systemDataList.push(new SystemData(0, 'UDC', 80, 'UDC 80', 'UDC 80', '', 'udc_80', 'udc_80'));
        systemDataList.push(new SystemData(1, 'UDC', 80, 'UDC 80.HI', 'UDC 80', 'HI', 'udc_80_hi', 'udc_80_hi'));
        systemDataList.push(new SystemData(2, 'UDC', 80, 'UDC 80.SI', 'UDC 80', 'SI', 'udc_80_si', 'udc_80_si'));
        systemDataList.push(new SystemData(3, 'UDC', 80, 'UDC 80.SI with XPS Filling', 'UDC 80', 'SI with XPS Filling', 'udc_80_si_xps', 'udc_80_si_xps'));
        break;
      case "AWS":
        systemDataList.push(new SystemData(0, 'AWS', 75, 'AWS 75.SI+', 'AWS 75', 'SI+', 'aws__75_si_plus', 'aws__75_si_plus'));
        systemDataList.push(new SystemData(1, 'AWS', 75, 'AWS 75 BS.SI+', 'AWS 75 BS', 'SI+', 'aws__75__bs_si_plus', 'aws__75__bs_si_plus'));
        systemDataList.push(new SystemData(2, 'AWS', 75, 'AWS 75 BS.HI+', 'AWS 75 BS', 'HI+', 'aws__75__bs_hi_plus', 'aws__75__bs_hi_plus'));
        systemDataList.push(new SystemData(3, 'AWS', 90, 'AWS 90.SI+', 'AWS 90', 'SI+', 'aws__90_si_plus', 'aws__90_si_plus'));
        systemDataList.push(new SystemData(4, 'AWS', 90, 'AWS 90 BS.SI+', 'AWS 90', 'SI+', 'aws__90__bs_si_plus', 'aws__90__bs_si_plus'));
        break;
      case "AWS114":
        systemDataList.push(new SystemData(0, 'AWS', 114, 'AWS 114', 'AWS 114', '', 'aws_114', 'aws_114'));
        systemDataList.push(new SystemData(0, 'AWS', 114, 'AWS 114.SI', 'AWS 114', 'SI', 'aws_114_si', 'aws_114_si'));
        systemDataList.push(new SystemData(0, 'AWS', 114, 'AWS 114 SG', 'AWS 114 SG', '', 'aws_114_sg', 'aws_114_sg'));
        systemDataList.push(new SystemData(0, 'AWS', 114, 'AWS 114 SG.SI', 'AWS 114 SG', 'SI', 'aws_114_sg_si', 'aws_114_sg_si'));
        break;
      case "ADS": //SRS
        systemDataList.push(new SystemData(0, 'ADS', 75, 'ADS 75', 'ADS 75', '', 'ads__75', 'ads__75'));
        break;
      case "ASE":
        systemDataList.push(new SystemData(0, 'ASE', 60, 'ASE 60', 'ASE 60', '', 'ase__60', 'ase__60'));
        break;
    }
    return systemDataList;
  }

  buildPhysicsTypeList(): any[] {
    return [
      { id: '1', value: 'Acoustic', description: 'Acoustic' },
      { id: '2', value: 'Structural', description: 'Structural' },
      { id: '3', value: 'Thermal', description: 'Thermal' }
    ];
  }
  buildFixedOpeningList(): any[] {
    return [
      { id: '1', value: 'Inward', description: 'Inward' },
      { id: '2', value: 'Outward', description: 'Outward' }
    ];
  }
  buildOperationTypeList(): any[] {
    return [
      { id: '1', value: 'Manual', description: 'Manual' },
      { id: '2', value: 'TipTronic', description: 'TipTronic' }
    ];
  }
  buildOperableTypeList(): any[] {
    return [
      { id: '1', value: 'tiltTurn-right', description: 'Turn-Tilt-Right' },
      { id: '2', value: 'tiltTurn-left', description: 'Turn-Tilt-Left' },
      { id: '3', value: 'sideHung-right', description: 'Side-Hung-Right' },
      { id: '4', value: 'sideHung-left', description: 'Side-Hung-Left' },
      { id: '5', value: 'bottomHung', description: 'Bottom-Hung' },
      { id: '6', value: 'topHung', description: 'Top-Hung' },
      { id: '7', value: 'parallelOpening', description: 'Parallel-Opening' },
      { id: '8', value: 'doubleVentSH', description: 4 },
      { id: '9', value: 'doubleVentST', description: 5 },
      { id: '10', value: 'singleDoor-left', description: 'Single-Door-Left' },
      { id: '11', value: 'singleDoor-right', description: 'Single-Door-Right' },
      { id: '12', value: 'doubleDoor-left', description: 'Double-Door-Active-Left' },
      { id: '13', value: 'doubleDoor-right', description: 'Double-Door-Active-Right' }
    ];
  }
  buildInsideHandleList(): any[] {
    return [
      { ArticleName: "240152", ArticleSetID: 1, Color: "Silver Grey - RAL 7001", ColorCode: "RAL 7001", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240153", ArticleSetID: 2, Color: "Jet Black - RAL 9005", ColorCode: "RAL 9005", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240155", ArticleSetID: 3, Color: "Traffic White - RAL 9016", ColorCode: "RAL 9016", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240168", ArticleSetID: 4, Color: "INOX", ColorCode: "INOX", Description: "Door Handle", Type: "Door Handle" }
    ];
  }
  buildOutsideHandleList(): any[] {
    return [
      { ArticleName: "240152", ArticleSetID: 1, Color: "Silver Grey - RAL 7001", ColorCode: "RAL 7001", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240153", ArticleSetID: 2, Color: "Jet Black - RAL 9005", ColorCode: "RAL 9005", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240155", ArticleSetID: 3, Color: "Traffic White - RAL 9016", ColorCode: "RAL 9016", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240168", ArticleSetID: 4, Color: "INOX", ColorCode: "INOX", Description: "Door Handle", Type: "Door Handle" },
      { ArticleName: "240099", ArticleSetID: 5, Color: "INOX", ColorCode: "INOX", Description: "Door Pull", Type: "Door Handle" }
    ];
  }
  buildHingeTypeList(): any[] {
    return [
      { ArticleName: "279545", ArticleSetID: 9, Color: "Silver Grey - RAL 7001", ColorCode: "RAL 7001", Description: "Surface Mounted", Type: "Hinge Type" },
      { ArticleName: "279546", ArticleSetID: 10, Color: "Jet Black - RAL 9005", ColorCode: "RAL 9005", Description: "Surface Mounted", Type: "Hinge Type" },
      { ArticleName: "279548", ArticleSetID: 11, Color: "Traffic White - RAL 9016", ColorCode: "RAL 9016", Description: "Surface Mounted", Type: "Hinge Type" },
      { ArticleName: "279549", ArticleSetID: 12, Color: "INOX", ColorCode: "INOX", Description: "Surface Mounted", Type: "Hinge Type" }
    ];
  }
  buildWindowHandleList(): any[] {
    return [
      { ArticleName: "247001", ArticleSetID: 6, Color: "Silver Grey - RAL 7001", ColorCode: "RAL 7001", Description: "Window Handle", Type: "Window Handle" },
      { ArticleName: "247002", ArticleSetID: 7, Color: "Jet Black - RAL 9005", ColorCode: "RAL 9005", Description: "Window Handle", Type: "Window Handle" },
      { ArticleName: "247004", ArticleSetID: 8, Color: "Traffic White - RAL 9016", ColorCode: "RAL 9016", Description: "Window Handle", Type: "Window Handle" }
    ];
  }
  buildProfileColorList(): any[] {
    return [
      { Description: 'Silver grey - RAL 7001', Value: 'RAL 7001', Image: '7001', Code: 'CFA2100B0' },
      { Description: 'Traffic white - RAL 9016', Value: 'RAL 9016', Image: '9016', Code: 'ORSS84121' },
      { Description: 'Jet black - RAL 9005', Value: 'RAL 9005', Image: '9005', Code: 'PFB70S4' },
      { Description: 'Anthracite grey - RAL 7016', Value: 'RAL 7016', Image: '7016', Code: 'HFH606S4' },
      { Description: 'Black-brown - RAL 8022', Value: 'RAL 8022', Image: '8022', Code: 'HFJ655S2' }
    ];
  }
  buildhandleColorList(): any[] {
    return [
      { Description: 'Silver grey - RAL 7001', Value: 'RAL 7001', Image: '7001', Code: 'CFA2100B0' },
      { Description: 'Traffic white - RAL 9016', Value: 'RAL 9016', Image: '9016', Code: 'ORSS84121' },
      { Description: 'Jet black - RAL 9005', Value: 'RAL 9005', Image: '9005', Code: 'PFB70S4' },
    ];
  }

  //#region isCheckOut Disable For Invalid Large Dimension
  public isCheckoutDisableInvalLargeDim: boolean = false;
  private sujCheckoutDisable_InvalidLargeDimension: Subject<boolean> = new Subject<boolean>();
  obsCheckoutDisable_InvalidLargeDimension = this.sujCheckoutDisable_InvalidLargeDimension.asObservable();
  setCheckoutDisable_InvalidLargeDimension(data: boolean) {
    this.isCheckoutDisableInvalLargeDim = data;
    this.sujCheckoutDisable_InvalidLargeDimension.next(this.isCheckoutDisableInvalLargeDim);
  }
  //#endregion

  //#region isCheckOut Disable For Invalid Small Dimension
  public isCheckoutDisableInvalSmallDim: boolean = false;
  private sujCheckoutDisable_InvalidSmallDimension: Subject<boolean> = new Subject<boolean>();
  obsCheckoutDisable_InvalidSmallDimension = this.sujCheckoutDisable_InvalidSmallDimension.asObservable();
  setCheckoutDisable_InvalidSmallDimension(data: boolean) {
    this.isCheckoutDisableInvalSmallDim = data;
    this.sujCheckoutDisable_InvalidSmallDimension.next(this.isCheckoutDisableInvalSmallDim);
  }
  //#endregion
  
  //#region To set Operability Panel is Active or not
  public isOperabilityPanelActive: boolean = false;
  private sujOperabilityPanelActive: Subject<boolean> = new Subject<boolean>();
  obsOperabilityPanelActive = this.sujOperabilityPanelActive.asObservable();
  setOperabilityPanelActive(data: boolean) {
    this.isOperabilityPanelActive = data;
    this.sujOperabilityPanelActive.next(this.isOperabilityPanelActive);
  }
  //#endregion

  //#region Operability Picker
  public selectedPicker: number = -1;
  private sujSelectedPicker_Operability: Subject<number> = new Subject<number>();
  obsSelectedPicker_Operability = this.sujSelectedPicker_Operability.asObservable();
  setSelectedPicker_Operability(data: number) {
    this.selectedPicker = data;
    this.sujSelectedPicker_Operability.next(this.selectedPicker);
    // if (this.selectedPicker && this.selectedPicker >= 0) {
    //   this.setPicker_Operability(this.picker_Operability[this.selectedPicker]);
    // }
  }
  //#endregion

  public picker_Operability: any[];
  private sujPicker_Operability: Subject<any> = new Subject<any>();
  obsPicker_Operability = this.sujPicker_Operability.asObservable();
  setPicker_Operability(data: any) {
    this.picker_Operability = data;
    if (data && data.idPicker >= 0) {
      this.picker_Operability.filter(f => f.idPicker === data.idPicker)[0] = data;
      this.picker_Operability = this.picker_Operability.map(x => { x.selected = !(x.idPicker != data.idPicker); return x });
    }
    this.sujPicker_Operability.next(this.picker_Operability);
  }
  checkUnpopulated_Operability(picker: any) {
    return picker.populated;
  }
  onAddPicker_Operability(): void {
    if (!this.picker_Operability) this.picker_Operability = this.buildPickerList_Operability();
    if (!this.picker_Operability[this.picker_Operability.length - 1].populated) {
      let firstUnpopulatedIndex: number = this.picker_Operability.findIndex(this.checkUnpopulated_Operability);
      this.selectedPicker = firstUnpopulatedIndex === -1 ? 0 : firstUnpopulatedIndex;
      this.picker_Operability[this.selectedPicker].populated = true;
      this.setSelectedPicker_Operability(this.selectedPicker);
    }
  }
  onRemovePicker_Operability() {
    this.picker_Operability[this.selectedPicker].populated = false;
    this.picker_Operability[this.selectedPicker].selected = false;
    this.picker_Operability[this.selectedPicker].fixedOpening = '';
    this.picker_Operability[this.selectedPicker].operableType = '';
    this.picker_Operability[this.selectedPicker].operationType = '';
    this.picker_Operability[this.selectedPicker].insideHandle = 'Window Handle';
    this.picker_Operability[this.selectedPicker].windowSystem = '';
    this.setPicker_Operability(this.picker_Operability);
  }
  buildPickerList_Operability(): any[] {
    // return this.picker_Operability = [
    //   { idPicker: 0, populated: false, selected: false, data: { fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' } },
    //   { idPicker: 1, populated: false, selected: false, data: { fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' } },
    //   { idPicker: 2, populated: false, selected: false, data: { fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' } },
    //   { idPicker: 3, populated: false, selected: false, data: { fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' } },
    //   { idPicker: 4, populated: false, selected: false, data: { fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' } },
    // ];
    return this.picker_Operability = [
      { idPicker: 0, populated: false, selected: false, fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' },
      { idPicker: 1, populated: false, selected: false, fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' },
      { idPicker: 2, populated: false, selected: false, fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' },
      { idPicker: 3, populated: false, selected: false, fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' },
      { idPicker: 4, populated: false, selected: false, fixedOpening: '', operableType: '', operationType: '', windowSystem: '', handleColor: 'Silver grey - RAL 7001', insideHandle: 'Door Handle', outsideHandle: 'Door Handle' },
    ];
  }

  //#region Glass Panel
  buildPickerList_GlassPanel(): any[] {
    return [
      { idPicker: 0, populated: false, article: { idArticle: 0, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction: null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt: 0, stc: 0, oitc: 0, blockDistance: 100, glassId_added: [] },
      { idPicker: 1, populated: false, article: { idArticle: 1, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction: null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt: 0, stc: 0, oitc: 0, blockDistance: 100, glassId_added: [] },
      { idPicker: 2, populated: false, article: { idArticle: 2, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction: null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt: 0, stc: 0, oitc: 0, blockDistance: 100, glassId_added: [] },
      { idPicker: 3, populated: false, article: { idArticle: 3, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction: null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt: 0, stc: 0, oitc: 0, blockDistance: 100, glassId_added: [] },
      { idPicker: 4, populated: false, article: { idArticle: 4, composition: "4-16-4", type: "glass-argon-glass", totalThickness: 24, thicknessFraction: null, totalThicknessUnit: "mm", uvalue: "1.1", uvalueBTU: "0", rw: 31, spacer: "1", psiValue: 0.13, category: 'double' }, shgc: 0, vt: 0, stc: 0, oitc: 0, blockDistance: 100, glassId_added: [] }
    ];
  }
  //#endregion
}


class SystemData {
  SystemId: number;
  SystemType: string = '';
  SystemNumber: number;
  Description: string = '';
  Value: string = '';
  Zone: string = '';
  Images: string = '';
  Images_temp: string = '';
  constructor(id, systemType, systemNumber, description, value, zone, images, images_temp) {
    this.SystemId = id;
    this.SystemType = systemType;
    this.SystemNumber = systemNumber;
    this.Description = description;
    this.Value = value;
    this.Zone = zone;
    this.Images = images;
    this.Images_temp = images_temp;
  }
}