import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ViewChild, AfterViewInit, OnChanges, OnDestroy } from '@angular/core';
import { BpsUnifiedModel, ModelInput, Structural, Thermal, CollapsedPanelStatus, UserSetting } from 'src/app/app-common/models/bps-unified-model';
import { IFrameEvent } from 'src/app/app-structural/models/iframe-exchange-data';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { ConfigureService } from 'src/app/app-structural/services/configure.service';
import { FramingComponent } from '../framing/framing.component';
import { GlassPanelComponent } from '../glass-panel/glass-panel.component';
import { AcousticComponent } from '../acoustic/acoustic.component';
import { OperabilityComponent } from '../operability/operability.component';
import { ThermalComponent } from '../thermal/thermal.component';
import { StructuralComponent } from '../structural/structural.component';
import { HomeService } from 'src/app/app-common/services/home.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UnifiedModelService } from 'src/app/app-structural/services/unified-model.service';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { Feature } from 'src/app/app-core/models/feature';
import { IframeService } from 'src/app/app-structural/services/iframe.service';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-left-configure',
  templateUrl: './left-configure.component.html',
  styleUrls: ['./left-configure.component.css']
})

export class LeftConfigureComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  //#region 3D Events
  @Input() iframeEvent: Subject<IFrameEvent>;
  @Input() event3D: any;
  @Input() canBeDrawnBool: boolean;
  //#endregion 
  
  //#region Input
  @Input() unified3DModel: BpsUnifiedModel;

  @Input() pressureValues: any;
  @Input() spacerTypeArticle: any;
  @Input() problemGuid: string;
  @Input() structuralTableFormData: any;
  @Input() orderPlaced: boolean;
  @Input() handlePosition: number;
  //#endregion
  
  //#region Output
  @Output() sendParentEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter();
  @Output() sendParentStatusEvent: EventEmitter<any> = new EventEmitter();
  @Output() openCloseGlassPanelTableEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() ActivePanelEvent: EventEmitter<any> = new EventEmitter<any>();

  //profileColor -------------------
  @Output() sendCurrentProfileColorFromParent: EventEmitter<any> = new EventEmitter<any>();
  @Output() windPressureEvent: EventEmitter<number> = new EventEmitter<number>();
  //@Output() handlePositionEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() handleColorEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() profileColorEvent: EventEmitter<any> = new EventEmitter<any>();
  //profileColor -------------------

  @Output() unified3DModelEvent: EventEmitter<BpsUnifiedModel> = new EventEmitter<BpsUnifiedModel>();
  @Output() systemFacadeSelectedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() systemFacadeSelectedFromFramingEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onChangeProductTypeEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngNotificaionShow: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClosePopoutsEvent: EventEmitter<any> = new EventEmitter<any>();

  @Output() onCloseFramingPopoutsEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCloseSpacerTypePopoutEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() onCloseFrameCombinationPopoutEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() systemSelectedEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() getSpacerTypeByKeyEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendDinWindLoadToTableEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() openLeftStructuralTableTableEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearStructuralTableEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateListEvent: EventEmitter<null> = new EventEmitter();
  //#endregion
  
  //#region ViewChild
  @ViewChild('operabilityComponent') operabilityComponent: OperabilityComponent;
  @ViewChild('acousticComponent') acousticComponent: AcousticComponent;
  @ViewChild('glassPanelComponent') glassPanelComponent: GlassPanelComponent;
  @ViewChild('structural') structuralComponent: StructuralComponent;
  @ViewChild('thermal') thermalComponent: ThermalComponent;
  @ViewChild('framing') framingComponent: FramingComponent;
  //#endregion

  //#region Local  
  unified3DModelCopy: BpsUnifiedModel;
  showSolverButtonContent: boolean;
  facadeType: string = '';
  Window: string = '';
  applicationType: string;
  orderPlaceCheck: boolean = false;
  isProductTypeChangeInProgress: boolean = false;
  yNumberOfPanels = 1;
  xNumberOfPanels = 2;  
  //element_hover: string = '';
  computeBool: boolean = false;
  isAccordianDisabled: boolean;
  isValidStructural: boolean = true;
  isValidThermal: boolean = true;
  disableGridConfirm: boolean = false;
  infoBtnSelected: boolean = false;

  //Panel Valid --------------------------
  panelOperabilityValid: boolean = true;
  panelSlidingUnitValid: boolean = true;
  panelGlassPanelValid: boolean = false;
  panelFramingValid: boolean = true;
  panelLoadPanelValid: boolean = true;
  panelAcousticValid: boolean = true;
  // panelStructuralValid: boolean = false;
  // panelThermalValid: boolean = true;
  //--------------------------------------

  //Panel Active --------------------------
  isOperabilityActive: boolean = false;
  isSlidingUnitActive: boolean = false;
  isGlassPanelActive: boolean = false;
  isFramingActive: boolean = false;
  isStructuralActive: boolean = false;
  isAcousticActive: boolean = false;
  isThermalActive: boolean = false;
  isLoadActive: boolean = false;
  //--------------------------------------

  //translate --------------------------
  productTypeToolTip: string = this.translate.instant(_('configure.window'));
  operabilityText: string = this.translate.instant(_('configure.operability')).toUpperCase();
  slidingUnitText: string = "SLIDING UNIT";
  glassAndPanelText: string = this.translate.instant(_('configure.glass-and-panel')).toUpperCase();
  framingText: string = this.translate.instant(_('configure.framing')).toUpperCase();
  acousticText: string = this.translate.instant(_('configure.acoustic')).toUpperCase();
  structuralText: string = this.translate.instant(_('configure.structural')).toUpperCase();
  thermalText: string = this.translate.instant(_('configure.thermal')).toUpperCase();
  loadText: string = this.translate.instant(_('configure.load')).toUpperCase();
  facade_glassAndPanelText: string = this.translate.instant(_('configure.glass-and-panel')).toUpperCase();
  facade_insertUnits: string = this.translate.instant(_('configure.leftconfigure-facade-InsertUnits'));
  operabilityHeader = this.translate.instant(_('configure.operability')).toUpperCase();
  glassHeader = this.translate.instant(_('configure.glass-and-panel')).toUpperCase();
  //--------------------------------------

  //Subscription --------------------------
 private destroy$ = new Subject<void>();
  //--------------------------------------

  //#endregion
  
  //#region Feature
  feature = Feature;
  slidingUnitComponent: any;
  //#endregion

  constructor(
    private umService: UnifiedModelService, private cpService: ConfigPanelsService,
    private iframeService: IframeService, private configureService: ConfigureService,
    private sanitizer: DomSanitizer, private translate: TranslateService,
    private homeService: HomeService, private permissionService: PermissionService) {
    this.applicationType = this.configureService.applicationType;
    if (this.applicationType === 'SRS')
      this.productTypeToolTip = this.translate.instant(_('configure.window')) + '/' + this.translate.instant(_('configure.door'));
  }

  ngOnInit(): void {
    this.unified3DModel = this.umService.current_UnifiedModel;
    this.umService.obsUnifiedModel.subscribe(
      response => {
        if (response) {
          this.unified3DModel = response;
          if (this.unified3DModel.ProblemSetting.ProductType && this.unified3DModel.ProblemSetting.SlidingDoorType) this.isProductTypeChangeInProgress = false;
          this.generateDownloadJsonUri();
        }
      });

      this.configureService.obsInfoBtn.pipe(takeUntil(this.destroy$)).subscribe(response => {
        this.infoBtnSelected = response;
      });

    this.umService.obsLoadDisplaySetting.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadDisplaySetting_ActivePanel();
    });
    this.onLeftConfigureLoad();
    this.generateDownloadJsonUri();
    if (this.permissionService.checkPermission(Feature.GlassPanelShortInfo))
      this.glassHeader = this.translate.instant(_('configure.glass')).toUpperCase();
    this.configureService.computeClickedSubject.pipe(takeUntil(this.destroy$)).subscribe((isClicked) => {
      this.generateDownloadJsonUri();
      if (!isClicked) {
        if (!(this.applicationType == 'SRS' && this.unified3DModel.SRSProblemSetting.isOrderPlaced)) {
          this.unified3DModel.AnalysisResult = null;
        }
        // this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      }
    });
  }
  /*onUnifiedModelUpdated() {
    if (this.umService.isProblemChanged) {
      this.onLeftConfigureLoad();
    }
  }*/
  onLeftConfigureLoad() {
    // if (this.unified3DModel.ProblemSetting.ProductType === 'SlidingDoor'){
    //   this.Window = this.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0].SlidingDoorType;
    // }
    // else if (this.unified3DModel.ProblemSetting.ProductType !== 'SlidingDoor') {
    //   this.Window = null;
    // }
    this.showSolverButtonContent = this.configureService.newProblemBool || (this.unified3DModel.CollapsedPanels && this.unified3DModel.CollapsedPanels.Panel_Configure) ||
      (this.unified3DModel.ProblemSetting && (!Boolean(this.unified3DModel.ProblemSetting.ProductType
        && (!(this.permissionService.checkPermission(Feature.PhysicsTypes)) || this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableStructural || this.unified3DModel.ProblemSetting.EnableThermal))));
    this.configureService.newProblemBool = false;
    this.setAccordionBool();
    if (this.isAccordianDisabled) {
      this.isGlassPanelActive = false;
      this.isFramingActive = false;
      this.isOperabilityActive = false;
      this.isSlidingUnitActive = false;
    }
    // this.checkboxAImg = this.unified3DModel.ProblemSetting.EnableAcoustic ? 'assets/bps-icons/sps_rectangle_icon_acoustic_active.svg' : 'assets/bps-icons/sps_rectangle_icon_acoustic_enabled.svg';
    // this.checkboxBImg = this.unified3DModel.ProblemSetting.EnableStructural ? 'assets/bps-icons/sps_rectangle_icon_structural_active.svg' : 'assets/bps-icons/sps_rectangle_icon_structural_enabled.svg';
    // this.checkboxCImg = this.unified3DModel.ProblemSetting.EnableThermal ? 'assets/bps-icons/sps_rectangle_icon_thermal_active.svg' : 'assets/bps-icons/sps_rectangle_icon_thermal_enabled.svg';
    if (this.unified3DModel.ProblemSetting.ProductType === 'Window'
      && this.permissionService.checkPermission(Feature.GlassPanelHeader) && this.permissionService.checkPermission(Feature.Operability)) {
        this.operabilityHeader = this.operabilityText;
        this.glassHeader = this.glassAndPanelText;
    }
    else if (this.unified3DModel.ProblemSetting.ProductType === 'Facade'
    && this.permissionService.checkPermission(Feature.FacadeGlassPanelHeader) && this.permissionService.checkPermission(Feature.FacadeInsertUnitText)) {
      this.operabilityHeader = this.facade_insertUnits;
      this.glassHeader = this.facade_glassAndPanelText;
    }
    this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels == undefined ? 3 : this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels;
    this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels == undefined ? 2 : this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels;
    this.xNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels - 1;
    this.yNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels - 1;

    if (!this.unified3DModel.CollapsedPanels) {
      this.unified3DModel.CollapsedPanels = new CollapsedPanelStatus();
    }
    //this.unified3DModel.CollapsedPanels.Panel_Configure = true; break;
    this.isFramingActive = this.unified3DModel.CollapsedPanels.Panel_Framing;
    this.isGlassPanelActive = this.unified3DModel.CollapsedPanels.Panel_Glass;
    this.isOperabilityActive = this.unified3DModel.CollapsedPanels.Panel_Operability;
    this.isSlidingUnitActive = this.unified3DModel.CollapsedPanels.Panel_SlidingUnit;
    this.isStructuralActive = this.unified3DModel.CollapsedPanels.Panel_Structural;
    this.isAcousticActive = this.unified3DModel.CollapsedPanels.Panel_Acoustic;
    this.isThermalActive = this.unified3DModel.CollapsedPanels.Panel_Thermal;
    this.isLoadActive = this.unified3DModel.CollapsedPanels.Panel_Load;
    this.showSolverButtonContent = this.unified3DModel.CollapsedPanels.Panel_Configure;
  }

  ngOnChanges(Changes: SimpleChanges) {
    this.orderPlaceCheck = this.orderPlaced;

    if (Changes) {
      if (Changes.event3D) {
        setTimeout(() => {
          this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels == undefined ? 2 : this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels;
          this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels == undefined ? 3 : this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels;
          this.xNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.xNumberOfPanels - 1;
          this.yNumberOfPanels = this.unified3DModel.ModelInput.FrameSystem.yNumberOfPanels - 1;
        }, 1000);
      }
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue && Changes.unified3DModel.previousValue
        && (Changes.unified3DModel.currentValue.ProblemSetting.ProblemGuid != Changes.unified3DModel.previousValue.ProblemSetting.ProblemGuid)) {
        this.unified3DModel = Changes.unified3DModel.currentValue;
        this.generateDownloadJsonUri();
        this.onLeftConfigureLoad();
      }
      if (!this.unified3DModel.ProblemSetting.EnableAcoustic && !this.unified3DModel.ProblemSetting.EnableStructural && !this.unified3DModel.ProblemSetting.EnableThermal) {
        this.computeBool = false;
      }
      if (Changes.event3D) {                             //  PENDING, need Brian's confirmation
        if (Changes.event3D.currentValue && Changes.event3D.currentValue.eventType) {
          switch (Changes.event3D.currentValue.eventType) {
            case "changeUnifiedModel":
              setTimeout(() => {
                if (this.isOperabilityActive) {
                  let displaySettings: any;
                  displaySettings = {
                    showBCSymbols: false,
                    showThreeDView: false,
                    showAxes: false,
                    showGlassID: true, // new
                    showVentInfo: true, // new
                    showGrid: true,
                    showGlazingTypeColor: false, // new
                    showControls: true,
                    enableOrbitControls: true,
                    showThermalResultLabel: false,
                    showQuickCheckSymbols: true
                  };
                  this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
                }
                else if (this.isSlidingUnitActive) {
                  let displaySettings: any;
                  displaySettings = {
                    showBCSymbols: false,
                    showThreeDView: false,
                    showAxes: false,
                    showGlassID: true, // new
                    showVentInfo: true, // new
                    showGrid: true,
                    showGlazingTypeColor: false, // new
                    showControls: true,
                    enableOrbitControls: true,
                    showThermalResultLabel: false,
                    showQuickCheckSymbols: true
                  };
                  this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
                }
                else if (this.isGlassPanelActive) {
                  let displaySettings: any;
                  displaySettings = {
                    showBCSymbols: false,
                    showThreeDView: false,
                    showAxes: false,
                    showGlassID: true, // new
                    showVentInfo: false, // new
                    showGrid: true,
                    showGlazingTypeColor: true, // new
                    showControls: true,
                    enableOrbitControls: true,
                    showThermalResultLabel: false,
                    showQuickCheckSymbols: true
                  };
                  if (this.operabilityComponent && this.operabilityComponent.isOneGlassApplied()) {
                    displaySettings.showVentInfo = true;
                  }
                  this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
                }
              });
              break;
          }
        }
      }
    }
  }

  ngAfterViewInit() {
    this.validatePanel(true, 'Acoustic');
    this.validatePanel(true, 'GlassPanel');
    if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
      if (this.unified3DModel.ModelInput.Geometry.Infills.filter(f => f.InsertWindowSystem && f.InsertWindowSystem.indexOf("AWS 114") > -1).length > 0) {
        setTimeout(() => {
          this.unified3DModel.ProblemSetting.EnableAcoustic = false;
        }, 1);
      }
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();    
  }

  //closedByDot: boolean = true;
  onChangeSolverButtonContentDisplay(): void {
    //this.closedByDot = true;
    this.showSolverButtonContent = !this.showSolverButtonContent;
    this.collapseAllPanels('Configure');
  }

  ngNotificaionShowEvent(event: any) {
    this.ngNotificaionShow.next(event);
  }

  afterChangeStatus(event: any): void {
    if (event === "EnableAcoustic" && this.unified3DModel.ProblemSetting.EnableAcoustic) {
      this.isAcousticGlassFormValid();
    }
    if (event === "EnableThermal" && this.unified3DModel.ProblemSetting.EnableThermal) {
      this.isThermalGlassFormValid();
    }
    setTimeout(() => {
      if (this.glassPanelComponent) {
        this.panelGlassPanelValid = this.glassPanelComponent.isValid();
      }
    }, 250);
  }
  onChangeStatus(): void {
    this.unified3DModel.ProblemSetting.isAcousticEnabled = this.unified3DModel.ProblemSetting.EnableAcoustic;
    this.unified3DModelCopy = this.unified3DModel;
    if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
      if (this.unified3DModel.ModelInput.Geometry.GlazingSystems.filter(element => element.Category === "custom" && element.Plates.length === 3).length > 0) {
        setTimeout(() => {
          this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-custom-triple-layer-glass')), logoToShow: 'Acoustic' });
          this.unified3DModel.ProblemSetting.EnableAcoustic = false;
          this.unified3DModelCopy.ProblemSetting.EnableAcoustic = false;
        }, 1);
      }
      if (this.unified3DModel.ModelInput.Geometry.Infills.filter(f => f.InsertWindowSystem && f.InsertWindowSystem.indexOf("AWS 114") > -1).length > 0) {
        setTimeout(() => {
          if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentOperableType === "Top-Hung").length > 0)
            this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Top-Hung-openings')), logoToShow: 'Acoustic' });

          if (this.unified3DModel.ModelInput.Geometry.OperabilitySystems && this.unified3DModel.ModelInput.Geometry.OperabilitySystems.filter(f => f.VentOperableType === "Parallel-Opening").length > 0)
            this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.acoustic-disabled')), message: this.translate.instant(_('notification.acoustic-solver-does-not-support-Parallel-openings')), logoToShow: 'Acoustic' });

          this.unified3DModel.ProblemSetting.EnableAcoustic = false;
          this.unified3DModelCopy.ProblemSetting.EnableAcoustic = false;
        }, 1);
      }
    }

    if (!this.unified3DModel.ProblemSetting.EnableAcoustic) {
      this.unified3DModel.ModelInput.Acoustic = null;
    }
    if(this.permissionService.checkPermission(Feature.PhysicsTypes)){
      if (this.unified3DModel.ProblemSetting.EnableStructural) {
        if(this.unified3DModel.ModelInput.Structural == null){ //default Structural Object
          this.unified3DModel.ModelInput.Structural = new Structural();
          this.unified3DModel.ModelInput.Structural.DispIndexType = 1;
          this.unified3DModel.ModelInput.Structural.DispHorizontalIndex = 0;
          this.unified3DModel.ModelInput.Structural.DispVerticalIndex = 0;
          this.unified3DModel.ModelInput.Structural.WindLoadInputType = 1;
          this.unified3DModel.ModelInput.Structural.dinWindLoadInput = null;
          this.unified3DModel.ModelInput.Structural.WindLoad = 0.96;
          this.unified3DModel.ModelInput.Structural.Cpp = 1.0;
          this.unified3DModel.ModelInput.Structural.Cpn = -1.0;
          this.unified3DModel.ModelInput.Structural.HorizontalLiveLoad = 0.0;
          this.unified3DModel.ModelInput.Structural.HorizontalLiveLoadHeight = 0.0;
          this.unified3DModel.ModelInput.Structural.LoadFactor = null;
          this.unified3DModel.ModelInput.Structural.SeasonFactor = null;
          this.unified3DModel.ModelInput.Structural.TemperatureChange = null;
          this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          this.unified3DModel.ModelInput.Structural.ShowWindPressure = false;
          this.unified3DModel.ModelInput.Structural.PositiveWindPressure = null;
          this.unified3DModel.ModelInput.Structural.NegativeWindPressure = null;
        }
      }
      else {
        this.unified3DModel.ModelInput.Structural = null;
      }
    }

    if (!this.unified3DModel.ProblemSetting.EnableThermal) {
      this.unified3DModel.ModelInput.Thermal = null;
    }
    this.sendParentStatusEvent.emit(this.unified3DModel);   // send to loadJSON
    this.enableCompute();
    this.setAccordionBool();
  }


  isAcousticGlassFormValid(): boolean {
    // loop and check if any of the rw uvalues are empty for A and T.
    if (!this.unified3DModel.CollapsedPanels.Panel_Glass && this.unified3DModel.ProblemSetting.EnableAcoustic) {
      var alertRwMsg = this.translate.instant(_('notification.missing-Rw-information'));

      var alertRwIds = "";
      this.unified3DModel.ModelInput.Geometry.GlazingSystems.forEach(gs => {
        if (this.unified3DModel.ProblemSetting.EnableAcoustic && (gs.Rw === undefined || gs.Rw.toString() == "N/D" || gs.Rw.toString() === "0") && this.unified3DModel.ModelInput.Geometry.Infills.filter(i => i.GlazingSystemID === gs.GlazingSystemID).length > 0) {
          alertRwIds += gs.GlazingSystemID + " ";
        }
      });
      if (alertRwIds !== "") {
        setTimeout(() => {
          if (alertRwIds !== "")
            this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.missing-information')), message: alertRwMsg.replace("{0}", alertRwIds), logoToShow: 'Acoustic' });
        }, 200);
        return false;
      }
    }
  }


  isThermalGlassFormValid(): boolean {
    // loop and check if any of the rw uvalues are empty for A and T.
    if (!this.unified3DModel.CollapsedPanels.Panel_Glass && this.unified3DModel.ProblemSetting.EnableThermal) {
      var alertUValueMsg = this.translate.instant(_('notification.missing-UValue-information'));

      var alertUValueIds = "";
      this.unified3DModel.ModelInput.Geometry.GlazingSystems.forEach(gs => {
        if (this.unified3DModel.ProblemSetting.EnableThermal && (gs.UValue === undefined || gs.UValue.toString() === "N/D" || gs.UValue.toString() === "0") && this.unified3DModel.ModelInput.Geometry.Infills.filter(i => i.GlazingSystemID === gs.GlazingSystemID).length > 0) {
          alertUValueIds += gs.GlazingSystemID + " ";
        }
      });
      if (alertUValueIds !== "") {
        setTimeout(() => {
          if (alertUValueIds !== "")
            this.ngNotificaionShow.next({ title: this.translate.instant(_('notification.missing-information')), message: alertUValueMsg.replace("{0}", alertUValueIds), logoToShow: 'Thermal' });
        }, 200);
        return false;
      }
    }
  }

  GetDefaultProblemForFacadeUDCProject(projectId: string, ProblemId: string) {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.homeService.GetDefaultProblemForFacadeUDCProject(projectId, ProblemId).subscribe((problem) => {
        if (projectId) {
          let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
          that.unified3DModel = unifiedModel;
          if (!that.unified3DModel.UserSetting)
            that.unified3DModel.UserSetting = new UserSetting();
          that.unified3DModel.UserSetting.ApplicationType = that.configureService.applicationType;
          if (that.permissionService.checkPermission(Feature.OrderingApp))
            that.unified3DModel.SRSProblemSetting.isOrderPlaced = problem.OrderPlaced;
          that.unified3DModelEvent.emit(that.unified3DModel);

          that.updateListEvent.emit();
          that.configureService.configureCall = false;
          that.configureService.setProblemShow(problem.ProblemGuid);
          that.configureService.sendMessage(false);
          that.configureService.newProblemBool = true;
          if (that.unified3DModelCopy !== null && that.unified3DModelCopy !== undefined) {
            that.unified3DModel.ProblemSetting.ProductType = that.unified3DModelCopy.ProblemSetting.ProductType;
            that.unified3DModel.ProblemSetting.FacadeType = that.unified3DModelCopy.ProblemSetting.FacadeType;
            that.unified3DModel.ProblemSetting.EnableAcoustic = that.unified3DModelCopy.ProblemSetting.EnableAcoustic;
            that.unified3DModel.ProblemSetting.EnableStructural = that.unified3DModelCopy.ProblemSetting.EnableStructural;
            that.unified3DModel.ProblemSetting.EnableThermal = that.unified3DModelCopy.ProblemSetting.EnableThermal;
            that.unified3DModelCopy = null;
            that.sendParentStatusEvent.emit(that.unified3DModel);
          }
        }
        resolve(true);
      }, error => {
        reject(false);
      });
    });
  }

  GetDefaultProblemForFacadeProject(projectId: string, ProblemId: string) {
    const that = this;
    return new Promise(function (resolve, reject) {
      const newFacadeLayout = {
        xPanelNo: that.xNumberOfPanels + 1,
        yPanelNo: that.yNumberOfPanels + 1,
        xInterval: 2000,
        yInterval: 2000,
      };
      that.homeService.GetDefaultProblemForFacadeProject(projectId, ProblemId, newFacadeLayout).subscribe((problem) => {
        if (projectId) {
          let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
          that.unified3DModel = unifiedModel;
          if (!that.unified3DModel.UserSetting)
            that.unified3DModel.UserSetting = new UserSetting();
          that.unified3DModel.UserSetting.ApplicationType = that.configureService.applicationType;
          if (that.permissionService.checkPermission(Feature.OrderingApp))
            that.unified3DModel.SRSProblemSetting.isOrderPlaced = problem.OrderPlaced;
          that.unified3DModelEvent.emit(that.unified3DModel);

          that.updateListEvent.emit();
          that.configureService.configureCall = false;
          that.configureService.setProblemShow(problem.ProblemGuid);
          that.configureService.sendMessage(false);
          that.configureService.newProblemBool = true;
          if (that.unified3DModelCopy !== null && that.unified3DModelCopy !== undefined) {
            that.unified3DModel.ProblemSetting.ProductType = that.unified3DModelCopy.ProblemSetting.ProductType;
            that.unified3DModel.ProblemSetting.EnableAcoustic = that.unified3DModelCopy.ProblemSetting.EnableAcoustic;
            that.unified3DModel.ProblemSetting.EnableStructural = that.unified3DModelCopy.ProblemSetting.EnableStructural;
            that.unified3DModel.ProblemSetting.EnableThermal = that.unified3DModelCopy.ProblemSetting.EnableThermal;
            that.unified3DModelCopy = null;
            that.sendParentStatusEvent.emit(that.unified3DModel);
          }
        }
        resolve(true);
      }, error => {
        reject(false);
      });
    });
  }


  GetDefaultProblemForProject(projectId: string, ProblemId: string) {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.homeService.GetDefaultProblemForProject(projectId, ProblemId, that.configureService.applicationType).subscribe((problem) => {
        if (projectId) {
          let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
          that.unified3DModel = unifiedModel;
          if (!that.unified3DModel.UserSetting)
            that.unified3DModel.UserSetting = new UserSetting();
          that.unified3DModel.UserSetting.ApplicationType = that.configureService.applicationType;
          if (that.permissionService.checkPermission(Feature.OrderingApp))
            that.unified3DModel.SRSProblemSetting.isOrderPlaced = problem.OrderPlaced;
          that.unified3DModelEvent.emit(that.unified3DModel);

          that.updateListEvent.emit();
          that.configureService.configureCall = false;
          that.configureService.setProblemShow(problem.ProblemGuid);
          that.configureService.sendMessage(false);
          that.configureService.newProblemBool = true;
          if (that.unified3DModelCopy !== null && that.unified3DModelCopy !== undefined) {
            that.unified3DModel.ProblemSetting.ProductType = that.unified3DModelCopy.ProblemSetting.ProductType;
            that.unified3DModel.ProblemSetting.EnableAcoustic = that.unified3DModelCopy.ProblemSetting.EnableAcoustic;
            that.unified3DModel.ProblemSetting.EnableStructural = that.unified3DModelCopy.ProblemSetting.EnableStructural;
            that.unified3DModel.ProblemSetting.EnableThermal = that.unified3DModelCopy.ProblemSetting.EnableThermal;
            that.unified3DModelCopy = null;
            that.sendParentStatusEvent.emit(that.unified3DModel);
          }
        }
        resolve(true);
      }, error => {
        reject(false);
      });
    });
  }
  GetDefaultSlidingDoorProblemForProject(projectId: string, ProblemId: string) {
    const that = this;
    return new Promise(function (resolve, reject) {
      that.configureService.GetProblemForSlidingDoorProject(projectId, ProblemId, '2A_Left').subscribe((problem) => {
        if (projectId) {
          let unifiedModel: BpsUnifiedModel = JSON.parse(problem.UnifiedModel);
          that.unified3DModel = unifiedModel;
          if (!that.unified3DModel.UserSetting)
            that.unified3DModel.UserSetting = new UserSetting();
          that.unified3DModel.UserSetting.ApplicationType = that.configureService.applicationType;
          if (that.permissionService.checkPermission(Feature.OrderingApp)){
            if(that.unified3DModel.ModelInput.Structural === null) {
              that.unified3DModel.ModelInput.Structural = new Structural();
              that.unified3DModel.ModelInput.Structural.WindLoad = 1.68;
            } else if(that.unified3DModel.ModelInput.Structural && !that.unified3DModel.ModelInput.Structural.WindLoad){
              that.unified3DModel.ModelInput.Structural.WindLoad = 1.68;
            }
            that.unified3DModel.SRSProblemSetting.isOrderPlaced = problem.OrderPlaced;
          }
          that.unified3DModelEvent.emit(that.unified3DModel);

          that.updateListEvent.emit();
          that.configureService.configureCall = false;
          that.configureService.setProblemShow(problem.ProblemGuid);
          that.configureService.sendMessage(false);
          that.configureService.newProblemBool = true;
          if (that.unified3DModelCopy !== null && that.unified3DModelCopy !== undefined) {
            that.unified3DModel.ProblemSetting.ProductType = that.unified3DModelCopy.ProblemSetting.ProductType;
            that.unified3DModel.ProblemSetting.EnableAcoustic = that.unified3DModelCopy.ProblemSetting.EnableAcoustic;
            that.unified3DModel.ProblemSetting.EnableStructural = that.unified3DModelCopy.ProblemSetting.EnableStructural;
            that.unified3DModel.ProblemSetting.EnableThermal = that.unified3DModelCopy.ProblemSetting.EnableThermal;
            that.unified3DModelCopy = null;
            that.sendParentStatusEvent.emit(that.unified3DModel);
          }
        }
        resolve(true);
      }, error => {
        reject(false);
      });
    });
  }

  onChangeProductType(event: any, hidePanel: boolean = false, saveModel = false) {
    this.isProductTypeChangeInProgress = true;
    const that = this;
    const hideConfigPanel = hidePanel;
    const productType = that.unified3DModel.ProblemSetting.ProductType;
    const local_projLoc = that.unified3DModel.ProblemSetting.Location;
    const projName = that.unified3DModel.ProblemSetting.ProjectName;
    const configName = that.unified3DModel.ProblemSetting.ConfigurationName;
    const userName = that.unified3DModel.UserSetting.UserName;
    if (productType === 'SlidingDoor') {
      this.configureService.setMullionBarDisplay(false);
    } else {
      this.configureService.setMullionBarDisplay(true);
    }
    return new Promise(function (resolve, reject) {

      that.isFramingActive = that.unified3DModel.CollapsedPanels.Panel_Framing = false;
      that.isGlassPanelActive = that.unified3DModel.CollapsedPanels.Panel_Glass = false;
      that.isOperabilityActive = that.unified3DModel.CollapsedPanels.Panel_Operability = false;
      that.isSlidingUnitActive = that.unified3DModel.CollapsedPanels.Panel_SlidingUnit = false;
      that.isStructuralActive = that.unified3DModel.CollapsedPanels.Panel_Structural = false;
      that.isAcousticActive = that.unified3DModel.CollapsedPanels.Panel_Acoustic = false;
      that.isThermalActive = that.unified3DModel.CollapsedPanels.Panel_Thermal = false;
      that.isLoadActive = that.unified3DModel.CollapsedPanels.Panel_Load = false;
      that.onClosePopoutsEvent.emit();
      const enableAcoustic = that.unified3DModel.ProblemSetting.EnableAcoustic ? true : false;
      const enableStructural = that.unified3DModel.ProblemSetting.EnableStructural ? true : false;
      const enableThermal = that.unified3DModel.ProblemSetting.EnableThermal ? true : false;
      const facadeType = that.unified3DModel.ProblemSetting.FacadeType;
      const productType = that.unified3DModel.ProblemSetting.ProductType;
      const slidingDoorType = "Classic"
      that.unified3DModel.ProblemSetting.EnableAcoustic = false;
      that.unified3DModel.ProblemSetting.EnableStructural = false;
      that.unified3DModel.ProblemSetting.EnableThermal = false;
      that.unified3DModel.ProblemSetting.ProductType = undefined;
      if (productType === 'Window') {
        if (that.permissionService.checkPermission(Feature.Operability) && that.permissionService.checkPermission(Feature.GlassPanelFullInfo)) {
          that.operabilityHeader = that.operabilityText;
          that.glassHeader = that.glassAndPanelText;
        }
        that.GetDefaultProblemForProject(that.unified3DModel.ProblemSetting.ProjectGuid, that.unified3DModel.ProblemSetting.ProblemGuid).then(
          e => {
            that.unified3DModel.ProblemSetting.EnableAcoustic = enableAcoustic ? true : false;
            that.unified3DModel.ProblemSetting.EnableStructural = enableStructural ? true : false;
            that.unified3DModel.ProblemSetting.EnableThermal = enableThermal ? true : false;
            that.unified3DModel.ProblemSetting.ProductType = productType;
            that.onChangeStatus();
            if ((!that.permissionService.checkPermission(Feature.PhysicsTypes) && that.unified3DModel.ProblemSetting.ProductType) || (that.unified3DModel.ProblemSetting.ProductType
              && (that.unified3DModel.ProblemSetting.EnableAcoustic || that.unified3DModel.ProblemSetting.EnableStructural || that.unified3DModel.ProblemSetting.EnableThermal))) {
              if (that.unified3DModel.CollapsedPanels) that.unified3DModel.CollapsedPanels.Panel_Configure = false;
              that.showSolverButtonContent = false;
            }
            that.iframeService.setShowLoader(true);
            that.iframeService.loadJSON(that.iframeEvent, 'loadJSON', { Unified3DModel: that.unified3DModel });
            setTimeout(() => {
              that.panelGlassPanelValid = that.glassPanelComponent.isValid();
            }, 10);
            that.isProductTypeChangeInProgress = false;
            resolve(true);
          }
        );
      } else if (saveModel && productType == 'Facade' && facadeType == 'UDC') {
        that.unified3DModel.ProblemSetting.EnableAcoustic = false;
        if (that.permissionService.checkPermission(Feature.FacadeInsertUnitText) && that.permissionService.checkPermission(Feature.GlassPanelHeader)) {
          that.operabilityHeader = that.facade_insertUnits;
          that.glassHeader = that.facade_glassAndPanelText;
        }
        that.GetDefaultProblemForFacadeUDCProject(that.unified3DModel.ProblemSetting.ProjectGuid, that.unified3DModel.ProblemSetting.ProblemGuid).then(
          e => {
            that.unified3DModel.ProblemSetting.EnableAcoustic = false;
            that.unified3DModel.ProblemSetting.EnableStructural = enableStructural ? true : false;
            that.unified3DModel.ProblemSetting.EnableThermal = enableThermal ? true : false;
            that.unified3DModel.ProblemSetting.ProductType = productType;
            that.unified3DModel.ProblemSetting.FacadeType = facadeType;
            that.onChangeStatus();
            if (hideConfigPanel == true && (that.unified3DModel.ProblemSetting.ProductType
              && (that.unified3DModel.ProblemSetting.EnableAcoustic || that.unified3DModel.ProblemSetting.EnableStructural || that.unified3DModel.ProblemSetting.EnableThermal)))
              that.showSolverButtonContent = false;
            that.iframeService.loadJSON(that.iframeEvent, 'loadJSON', { Unified3DModel: that.unified3DModel });
            setTimeout(() => {
              that.panelGlassPanelValid = that.glassPanelComponent.isValid();
            }, 10);
            that.isProductTypeChangeInProgress = false;
            resolve(true);
          }
        );
      }
      else if (saveModel && productType === 'Facade' && facadeType == 'mullion-transom') {
        if (that.permissionService.checkPermission(Feature.FacadeGlassPanelHeader) && that.permissionService.checkPermission(Feature.FacadeInsertUnitText)) {
          that.operabilityHeader = that.facade_insertUnits;
          that.glassHeader = that.facade_glassAndPanelText;
        }
        that.GetDefaultProblemForFacadeProject(that.unified3DModel.ProblemSetting.ProjectGuid, that.unified3DModel.ProblemSetting.ProblemGuid).then(
          e => {
            that.unified3DModel.ProblemSetting.EnableAcoustic = enableAcoustic ? true : false;
            that.unified3DModel.ProblemSetting.EnableStructural = enableStructural ? true : false;
            that.unified3DModel.ProblemSetting.EnableThermal = enableThermal ? true : false;
            that.unified3DModel.ProblemSetting.ProductType = productType;
            that.unified3DModel.ProblemSetting.FacadeType = facadeType;
            that.onChangeStatus();
            if (hideConfigPanel == true && (that.unified3DModel.ProblemSetting.ProductType
              && (that.unified3DModel.ProblemSetting.EnableAcoustic || that.unified3DModel.ProblemSetting.EnableStructural || that.unified3DModel.ProblemSetting.EnableThermal)))
              that.showSolverButtonContent = false;
            that.iframeService.loadJSON(that.iframeEvent, 'loadJSON', { Unified3DModel: that.unified3DModel });
            setTimeout(() => {
              that.panelGlassPanelValid = that.glassPanelComponent.isValid();
            }, 10);
            that.isProductTypeChangeInProgress = false;
            resolve(true);
          }
        );
      } else if (productType == 'SlidingDoor' && event =="Classic") {
        // that.unified3DModel.ModelInput.Geometry.SlidingDoorSystems[0].SlidingDoorType = event;
        if (that.permissionService.checkPermission(Feature.Operability) && that.permissionService.checkPermission(Feature.GlassPanelFullInfo)) {
          that.operabilityHeader = that.operabilityText;
          that.glassHeader = that.glassAndPanelText;
        }
        that.GetDefaultSlidingDoorProblemForProject(that.unified3DModel.ProblemSetting.ProjectGuid, that.unified3DModel.ProblemSetting.ProblemGuid).then(
          e => {
            that.unified3DModel.ProblemSetting.EnableAcoustic = enableAcoustic ? true : false;
            that.unified3DModel.ProblemSetting.EnableStructural = enableStructural ? true : false;
            that.unified3DModel.ProblemSetting.EnableThermal = enableThermal ? true : false;
            that.unified3DModel.ProblemSetting.ProductType = productType;
            that.unified3DModel.ProblemSetting.Location = local_projLoc;
            that.unified3DModel.ProblemSetting.ProjectName = projName;
            that.unified3DModel.ProblemSetting.ConfigurationName = configName;
            that.unified3DModel.UserSetting.UserName = userName;
            that.onChangeStatus();
            if ((!that.permissionService.checkPermission(Feature.PhysicsTypes) && that.unified3DModel.ProblemSetting.ProductType) || (that.unified3DModel.ProblemSetting.ProductType
              && (that.unified3DModel.ProblemSetting.EnableAcoustic || that.unified3DModel.ProblemSetting.EnableStructural || that.unified3DModel.ProblemSetting.EnableThermal))) {
              if (that.unified3DModel.CollapsedPanels) that.unified3DModel.CollapsedPanels.Panel_Configure = false;
              that.showSolverButtonContent = false;
            }
            that.iframeService.setShowLoader(true);
            that.iframeService.loadJSON(that.iframeEvent, 'loadJSON', { Unified3DModel: that.unified3DModel });
            setTimeout(() => {
              that.panelGlassPanelValid = that.glassPanelComponent.isValid();
            }, 10);
            that.isProductTypeChangeInProgress = false;
            resolve(true);
          }
        );
      } else if (!saveModel) {
        that.iframeService.loadJSON(that.iframeEvent, 'loadJSON', { Unified3DModel: that.unified3DModel });
        that.unified3DModel.ProblemSetting.EnableAcoustic = enableAcoustic ? true : false;
        that.unified3DModel.ProblemSetting.EnableStructural = enableStructural ? true : false;
        that.unified3DModel.ProblemSetting.EnableThermal = enableThermal ? true : false;
        that.unified3DModel.ProblemSetting.ProductType = productType;
        that.unified3DModel.ProblemSetting.FacadeType = facadeType;
      }
      // else if(that.unified3DModel.ProblemSetting.ProductType === 'Door')
      // that.leftPanelComponent.CreateDefaultFacade(that.unified3DModel.ProblemSetting.ProjectGuid);
    });
  }

  onNumberOfPanelsChange(event: any) {
    if (event[0] < 0 && event[1] < 0) {
      this.disableGridConfirm = true;
    } else {
      this.disableGridConfirm = false;
      this.yNumberOfPanels = event[0];
      this.xNumberOfPanels = event[1];
    }
  }
  onCloseSolverContent() {
    this.onChangeProductType('Facade', true, true);
  }

  onCompute(): void {
    this.configureService.newProblemBool = false;
    this.sendParentEvent.emit(this.unified3DModel);
  }
  scrollToTop() {
    //if(this.closedByDot) {
    //this.closedByDot = false;
    const firstElementWithError = document.querySelector('.scrollTop');
    if (firstElementWithError) {
      firstElementWithError.scrollIntoView({ behavior: 'smooth' });
      //this.showSolverButtonContent = false;
    }
    //}
  }

  structuralPaneValid(structuralModel: Structural) {
    setTimeout(() => {
      if (!this.unified3DModel.ModelInput) {
        this.unified3DModel.ModelInput = new ModelInput();
      }
      //let alloy = this.unified3DModel.ModelInput.Structural? this.unified3DModel.ModelInput.Structural.Alloys: null;
     // this.unified3DModel.ModelInput.Structural = structuralModel;
      // if (alloy){
      //   this.unified3DModel.ModelInput.Structural.Alloys = alloy;
      // }
      if (this.isStructuralActive) {
        this.loadJSONService({ Unified3DModel: this.unified3DModel, canBeDrawn: this.canBeDrawnBool });
      }
      if (structuralModel && (structuralModel.WindLoad || structuralModel.dinWindLoadInput) && this.structuralComponent) {
        this.isValidStructural = this.structuralComponent.isFormValid();
      }
      else {
        this.isValidStructural = false;
      }
      this.enableCompute();
    });
  }

  thermalPaneValid(thermalModel: Thermal) {
    setTimeout(() => {
      if (!this.unified3DModel.ModelInput) {
        this.unified3DModel.ModelInput = new ModelInput();
      }
      if (thermalModel) {
        if (thermalModel.RelativeHumidity && this.thermalComponent) {
          this.isValidThermal = this.thermalComponent.isFormValid();
        }
        else {
          this.isValidThermal = false;
        }
      }
      else {
        this.isValidThermal = true;
      }
      this.enableCompute();
    });
  }

  generateDownloadJsonUri() {
    let theJSON = JSON.stringify(this.unified3DModel);
    let blob = new Blob([theJSON], { type: 'text/json' });
    let url = window.URL.createObjectURL(blob);
    let uri: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    this.configureService.currentUnifiedModel = uri;
  }

  enableCompute() {
    setTimeout(() => {
      if (this.permissionService.checkPermission(Feature.Compute)) {
        if ((this.panelOperabilityValid || this.panelSlidingUnitValid) && this.panelGlassPanelValid && this.panelFramingValid && (this.panelAcousticValid && this.unified3DModel.ProblemSetting.EnableAcoustic || !this.unified3DModel.ProblemSetting.EnableAcoustic) && (this.isValidStructural && this.unified3DModel.ProblemSetting.EnableStructural || !this.unified3DModel.ProblemSetting.EnableStructural) && (this.isValidThermal && this.unified3DModel.ProblemSetting.EnableThermal || !this.unified3DModel.ProblemSetting.EnableThermal) && (this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableStructural || this.unified3DModel.ProblemSetting.EnableThermal)) {
          this.computeBool = true;
        } else {
          if (this.computeBool) {
            this.computeBool = false;
            //disableresult
            this.configureService.computeClickedSubject.next(false);
          }
        }
      } else if (this.permissionService.checkPermission(Feature.Checkout)) {
        if ((this.panelOperabilityValid || this.panelSlidingUnitValid) && this.panelGlassPanelValid && this.panelFramingValid && this.panelLoadPanelValid) {
          this.computeBool = true;
          this.configureService.checkoutButtonEnabled.next(true);
        } else {
          if (this.computeBool) {
            this.computeBool = false;
            //disableresult
            this.configureService.computeClickedSubject.next(false);
            this.configureService.checkoutButtonEnabled.next(false);
          }
        }
      }
    }, 15);
  }

  onGetUnified3DModelFromAcoustic(acoustic_unified3DModel: any): void {
    this.unified3DModel.ModelInput.Acoustic = acoustic_unified3DModel.ModelInput.Acoustic;
    this.validatePanel(true, 'Acoustic');
  }

  onGetUnified3DModelFromChildren(child_unified3DModel: any): void {
    this.unified3DModel = child_unified3DModel;
  }

  collapseAllPanels(expand: string) {
    if (!this.unified3DModel.CollapsedPanels)
      this.unified3DModel.CollapsedPanels = new CollapsedPanelStatus();
    if (expand !== 'Configure') {
      this.unified3DModel.CollapsedPanels.Panel_Framing = false;
      this.unified3DModel.CollapsedPanels.Panel_Glass = false;
      this.unified3DModel.CollapsedPanels.Panel_Operability = false;
      this.unified3DModel.CollapsedPanels.Panel_SlidingUnit = false;
      this.unified3DModel.CollapsedPanels.Panel_Structural = false;
      this.unified3DModel.CollapsedPanels.Panel_Acoustic = false;
      this.unified3DModel.CollapsedPanels.Panel_Thermal = false;
      this.unified3DModel.CollapsedPanels.Panel_Load = false;
    }
    this.unified3DModel.CollapsedPanels.Panel_Configure = this.showSolverButtonContent;
    //this.resetThreeDModel();
    this.displaySettingPerAccordian(true);
    if (expand) {
      switch (expand) {
        //case 'Configure': this.unified3DModel.CollapsedPanels.Panel_Configure = this.showSolverButtonContent; break;
        case 'Framing': {
          this.unified3DModel.CollapsedPanels.Panel_Framing = this.isFramingActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'GlassPanel': {
          this.unified3DModel.CollapsedPanels.Panel_Glass = this.isGlassPanelActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'Operability': {
          this.unified3DModel.CollapsedPanels.Panel_Operability = this.isOperabilityActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'SlidingUnit': {
          this.unified3DModel.CollapsedPanels.Panel_SlidingUnit = this.isSlidingUnitActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'Structural': {
          this.unified3DModel.CollapsedPanels.Panel_Structural = this.isStructuralActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = true;
          break;
        }
        case 'Acoustic': {
          this.unified3DModel.CollapsedPanels.Panel_Acoustic = this.isAcousticActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'Thermal': {
          this.unified3DModel.CollapsedPanels.Panel_Thermal = this.isThermalActive;
          if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
            this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = false;
          break;
        }
        case 'Load': {
          this.unified3DModel.CollapsedPanels.Panel_Load = this.isLoadActive;
          break;
        }
      }
    }
  }

  validatePanel(_event: any, panel: string) {
    this.scrollToTop();
    this.cpService.closeAllPopouts();
    this.collapseAllPanels(panel);
    setTimeout(() => {
      switch (panel) {
        case 'Operability':
          this.panelOperabilityValid = true;
          break;
          case 'SlidingUnit':
          this.panelSlidingUnitValid = true;
          break;
        case 'GlassPanel':
          if (this.glassPanelComponent) {
            this.panelGlassPanelValid = this.glassPanelComponent.isValid();
            if (!this.isGlassPanelActive && !_event) {
              if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
                this.isAcousticGlassFormValid();
              }
              if (this.unified3DModel.ProblemSetting.EnableThermal) {
                this.isThermalGlassFormValid();
              }
            }
          }
          break;
        case 'Framing':
          this.panelFramingValid = true;
          break;
        case 'Load':
          this.panelLoadPanelValid = true
          break;
        case 'Acoustic':
          if (this.acousticComponent) {
            this.panelAcousticValid = this.acousticComponent.isFormValid();
          }
          break;
        case 'Structural':
          if (this.structuralComponent) {
            this.isValidStructural = this.structuralComponent.isFormValid();
          }
          break;
        case 'Thermal':
          break;
      }
      this.enableCompute();
    });
  }

  loadDisplaySetting_ActivePanel() {
    this.sendActivePanel();
  }

  sendActivePanel() {
    // if(this.unified3DModel.ProblemSetting.ProductType && this.unified3DModel.ProblemSetting.ProductType !== '') {
    //   this.showSolverButtonContent = false;
    // }

    this.iframeEvent.next(new IFrameEvent('deselectAll', {}));
    this.ActivePanelEvent.emit({ 
      operabilitypanel: this.isOperabilityActive, acousticpanel:  this.isAcousticActive, 
      thermalpanel:  this.isThermalActive, loadpanel:  this.isLoadActive, 
      glassNpanel: this.isGlassPanelActive, framing: this.isFramingActive, 
      structural: this.isStructuralActive, slidingUnitPanel: this.isSlidingUnitActive });
      
    if (this.operabilityComponent) {
      this.ActivePanelEvent.emit({ operabilityIsOneGlassApplied: this.operabilityComponent.isOneGlassApplied(), operability: this.isOperabilityActive, glassNpanel: this.isGlassPanelActive, framing: this.isFramingActive, structural: this.isStructuralActive });
    }
    else if(this.slidingUnitComponent) {
      this.ActivePanelEvent.emit({ slidingUnitIsOneGlassApplied: this.slidingUnitComponent.isOneGlassApplied(), slidingUnit: this.isSlidingUnitActive, glassNpanel: this.isGlassPanelActive, framing: this.isFramingActive, structural: this.isStructuralActive });
    }
    else {
      this.ActivePanelEvent.emit({ operabilityIsOneGlassApplied: false, operability: this.isOperabilityActive, glassNpanel: this.isGlassPanelActive, framing: this.isFramingActive, structural: this.isStructuralActive });
    }

    if (!this.isFramingActive) {
      this.onCloseFramingPopoutsEvent.emit();
    }
    if (!this.isGlassPanelActive) {
      this.onCloseSpacerTypePopoutEvent.emit();
    }
    if (!this.isOperabilityActive) {
      this.onCloseFrameCombinationPopoutEvent.emit();
    }
    if (!this.isSlidingUnitActive) {
      this.onCloseFrameCombinationPopoutEvent.emit();
    }

    if (this.isGlassPanelActive) {
      if (this.unified3DModel.ProblemSetting.EnableAcoustic) {
        this.isAcousticGlassFormValid();
      }
      if (this.unified3DModel.ProblemSetting.EnableThermal) {
        this.isThermalGlassFormValid();
      }
    }

    //displaySettings
    this.displaySettingPerAccordian();

  }

  displaySettingPerAccordian(onAccrodianClick: boolean = false) {
    const showBoundaryCondition = this.unified3DModel.ModelInput.Structural ? this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition : false;
    if (this.isOperabilityActive) {
      let displaySettings: any;
      displaySettings = {
        showBCSymbols: showBoundaryCondition,
        showThreeDView: onAccrodianClick ? false : null,
        //showThreeDView: this.unified3DModel.ProblemSetting.ProductType === 'Window' ? false : onAccrodianClick ? false : null,
        showAxes: false,
        showGlassID: true, // new
        showVentInfo: true, // new
        showGrid: true,
        showGlazingTypeColor: false, // new
        showControls: true,
        enableOrbitControls: true,
        showThermalResultLabel: false,
        showQuickCheckSymbols: true
      };
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
    else if (this.isSlidingUnitActive) {
      let displaySettings: any;
      displaySettings = {
        showBCSymbols: showBoundaryCondition,
        showThreeDView: onAccrodianClick ? false : null,
        //showThreeDView: this.unified3DModel.ProblemSetting.ProductType === 'Window' ? false : onAccrodianClick ? false : null,
        showAxes: false,
        showGlassID: true, // new
        showVentInfo: true, // new
        showGrid: true,
        showGlazingTypeColor: false, // new
        showControls: true,
        enableOrbitControls: true,
        showThermalResultLabel: false,
        showQuickCheckSymbols: true
      };
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
    else if (this.isGlassPanelActive) {
      let displaySettings: any;
      displaySettings = {
        showBCSymbols: showBoundaryCondition,
        showThreeDView: false,
        showAxes: false,
        showGlassID: true, // new
        showVentInfo: false, // new
        showGrid: true,
        showGlazingTypeColor: true, // new
        showControls: true,
        enableOrbitControls: true,
        showThermalResultLabel: false,
        showQuickCheckSymbols: true
      };
      if (this.operabilityComponent && this.operabilityComponent.isOneGlassApplied()) {
        displaySettings.showVentInfo = true;
      }
      if (this.slidingUnitComponent && this.slidingUnitComponent.isOneGlassApplied()) {
        displaySettings.showVentInfo = true;
      }
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    } else if (this.isStructuralActive) {
      if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
        this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = true;
      let displaySettings: any;
      displaySettings = {
        enableOrbitControls: true,
        showAxes: false,
        showBCSymbols: true,
        showControls: true,
        showGlassID: false,
        showGlazingTypeColor: false,
        showGrid: true,
        showThermalResultLabel: false,
        showThreeDView: false,
        showVentInfo: false,
        showQuickCheckSymbols: true
      }
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
    else if (this.isFramingActive) {
      let displaySettings: any;
      displaySettings = {
        showBCSymbols: false,
        showThreeDView: onAccrodianClick ? false : null,
        showAxes: false,
        showGlassID: this.infoBtnSelected ? true: false, // new
        showVentInfo: this.infoBtnSelected ? true: false, // new
        showGrid: true,
        showGlazingTypeColor: false, // new
        showControls: true,
        enableOrbitControls: true,
        showThermalResultLabel: false,
        showQuickCheckSymbols: true
      };
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    } else if (this.isLoadActive) {
      if (this.unified3DModel.ModelInput && this.unified3DModel.ModelInput.Structural)
        this.unified3DModel.ModelInput.Structural.ShowBoundaryCondition = true;
      let displaySettings: any;
      displaySettings = {
        enableOrbitControls: true,
        showAxes: false,
        showBCSymbols: true,
        showControls: true,
        showGlassID: false,
        showGlazingTypeColor: false,
        showGrid: true,
        showThermalResultLabel: false,
        showThreeDView: false,
        showVentInfo: false,
        showQuickCheckSymbols: true
      }
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
    else if (!this.isGlassPanelActive && (!this.isOperabilityActive || !this.isSlidingUnitActive)) {
      //if(!this.isStructuralActive) switchBoundary = false;
      let displaySettings: any;
      displaySettings = {
        showBCSymbols: false,
        showThreeDView: false,
        showAxes: false,
        showGlassID: false, // new
        showVentInfo: false, // new
        showGrid: true,
        showGlazingTypeColor: false, // new
        showControls: true,
        enableOrbitControls: true,
        showThermalResultLabel: false,
        showQuickCheckSymbols: true
      };
      this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
    }
  }

  resetThreeDModel() {
    let showBCSymbol: boolean = this.isStructuralActive ? true : false;
    let displaySettings: any;
    displaySettings = {
      enableOrbitControls: true,
      showAxes: false,
      showBCSymbols: showBCSymbol,
      showControls: true,
      showGlassID: this.isGlassPanelActive ? true : false,
      showGlazingTypeColor: this.isGlassPanelActive ? true : false,
      showGrid: true,
      showThermalResultLabel: false,
      showThreeDView: false,
      showVentInfo: (this.isGlassPanelActive || this.isOperabilityActive || this.isSlidingUnitActive) && ((this.operabilityComponent && this.operabilityComponent.isOneGlassApplied()) || (this.slidingUnitComponent && this.slidingUnitComponent.isOneGlassApplied())) ? true : false,
      showQuickCheckSymbols: true
    }
    this.iframeEvent.next(new IFrameEvent('loadDisplaySetting', { settings: displaySettings }));
  }

  setAccordionBool(): void {
    let isPhysicstypeSelected = (this.unified3DModel.ProblemSetting.EnableAcoustic || this.unified3DModel.ProblemSetting.EnableStructural || this.unified3DModel.ProblemSetting.EnableThermal);
    this.isAccordianDisabled = !this.permissionService.checkPermission(this.feature.PhysicsTypes) ? !Boolean(this.unified3DModel.ProblemSetting.ProductType)
      : this.permissionService.checkPermission(this.feature.PhysicsTypes) ? !Boolean(this.unified3DModel.ProblemSetting.ProductType && (isPhysicstypeSelected))
        : true;
  }

  onFacadeTypeChange() {
    // this.unified3DModel.ProblemSetting.FacadeType = this.facadeType;
    // this.unified3DModelEvent.emit(this.unified3DModel);  
    if (this.unified3DModel.ProblemSetting.FacadeType == 'UDC') {
      this.onChangeProductType('Facade', true, true);
    }
  }

  getProductType() {
    return this.unified3DModel.ProblemSetting.ProductType === 'Window' ? true : false;
  }
  getProductTypeWindow() {
    return this.unified3DModel.ProblemSetting.ProductType === 'Window' ? true : false;
  }
  isFacadeFeatureAllowed(){
    return this.permissionService.checkPermission(Feature.Facade);
  }
  isSlidingDoorFeatureAllowed(){
    return this.permissionService.checkPermission(Feature.SlidingDoor);
  }
  loadJSONService(data: any) {
    this.iframeService.loadJSON(this.iframeEvent, 'loadJSON', data);
  }
}
